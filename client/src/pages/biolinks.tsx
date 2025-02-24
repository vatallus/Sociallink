import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Link as LinkIcon, Plus, Edit, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SocialLinkValidator, SOCIAL_PLATFORMS, type Platform } from "@/components/social-link-validator";
import type { Biolink, SocialLink } from "@shared/schema";
import { Link } from "wouter";

function validateSlug(slug: string): { isValid: boolean; message?: string } {
  // Chỉ cho phép chữ thường, số và dấu gạch ngang
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  if (!slug) {
    return { isValid: false, message: "Vui lòng nhập đường dẫn" };
  }

  if (slug.length < 3) {
    return { isValid: false, message: "Đường dẫn phải có ít nhất 3 ký tự" };
  }

  if (slug.length > 50) {
    return { isValid: false, message: "Đường dẫn không được vượt quá 50 ký tự" };
  }

  if (!slugRegex.test(slug)) {
    return { 
      isValid: false, 
      message: "Đường dẫn chỉ được chứa chữ thường, số và dấu gạch ngang" 
    };
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    return {
      isValid: false,
      message: "Đường dẫn không được bắt đầu hoặc kết thúc bằng dấu gạch ngang"
    };
  }

  return { isValid: true };
}

export default function BiolinksDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedBiolink, setSelectedBiolink] = useState<Biolink | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBiolink, setEditingBiolink] = useState<Biolink | null>(null);
  const [newBiolink, setNewBiolink] = useState({
    title: "",
    description: "",
    slug: "",
  });
  const [slugError, setSlugError] = useState<string>("");
  const [newSocialLink, setNewSocialLink] = useState({
    platform: "" as Platform,
    url: "",
  });
  const [isUrlValid, setIsUrlValid] = useState(false);

  const { data: biolinks, isLoading } = useQuery<Biolink[]>({
    queryKey: ["/api/biolinks"],
  });

  const { data: socialLinks } = useQuery<SocialLink[]>({
    queryKey: ["/api/biolinks", selectedBiolink?.id, "social-links"],
    enabled: !!selectedBiolink,
  });

  const createBiolinkMutation = useMutation({
    mutationFn: async (data: typeof newBiolink) => {
      const res = await apiRequest("POST", "/api/biolinks", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biolinks"] });
      setNewBiolink({ title: "", description: "", slug: "" });
      toast({
        title: "Thành công",
        description: "Đã tạo hồ sơ thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo hồ sơ.",
        variant: "destructive",
      });
    },
  });

  const handleSlugChange = (value: string) => {
    // Tự động chuyển đổi thành slug hợp lệ
    const normalizedSlug = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')  // Thay thế ký tự không hợp lệ bằng dấu gạch ngang
      .replace(/-+/g, '-');         // Gộp nhiều dấu gạch ngang liên tiếp

    setNewBiolink({ ...newBiolink, slug: normalizedSlug });

    const validation = validateSlug(normalizedSlug);
    setSlugError(validation.message || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSlug(newBiolink.slug);
    if (!validation.isValid) {
      toast({
        title: "Lỗi",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/public/biolinks/by-slug/${newBiolink.slug}`);
      if (response.ok) {
        toast({
          title: "Lỗi",
          description: "Đường dẫn này đã được sử dụng, vui lòng chọn đường dẫn khác",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      // Nếu nhận được lỗi 404, có nghĩa là slug chưa được sử dụng
      createBiolinkMutation.mutate(newBiolink);
    }
  };

  const updateBiolinkMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof newBiolink> }) => {
      const res = await apiRequest("PATCH", `/api/biolinks/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biolinks"] });
      setIsEditModalOpen(false);
      setEditingBiolink(null);
      toast({
        title: "Thành công",
        description: "Đã cập nhật hồ sơ thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể cập nhật hồ sơ.",
        variant: "destructive",
      });
    },
  });

  const createSocialLinkMutation = useMutation({
    mutationFn: async (data: typeof newSocialLink & { biolinkId: number }) => {
      const res = await apiRequest(
        "POST",
        `/api/biolinks/${data.biolinkId}/social-links`,
        data
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/biolinks", selectedBiolink?.id, "social-links"],
      });
      setNewSocialLink({ platform: "" as Platform, url: "" });
      toast({
        title: "Thành công",
        description: "Đã thêm liên kết mạng xã hội.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm liên kết.",
        variant: "destructive",
      });
    },
  });

  const deleteBiolinkMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/biolinks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biolinks"] });
      toast({
        title: "Thành công",
        description: "Đã xóa hồ sơ thành công.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hồ sơ.",
        variant: "destructive",
      });
    },
  });

  const handleAddSocialLink = () => {
    if (!selectedBiolink || !isUrlValid) return;
    createSocialLinkMutation.mutate({
      ...newSocialLink,
      biolinkId: selectedBiolink.id,
    });
  };

  const handleEdit = (biolink: Biolink) => {
    setEditingBiolink(biolink);
    setIsEditModalOpen(true);
  };

  const handleUpdateBiolink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiolink) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      slug: formData.get('slug') as string,
    };

    updateBiolinkMutation.mutate({
      id: editingBiolink.id,
      data,
    });
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn xóa hồ sơ này không?");
    if (confirmed) {
      await deleteBiolinkMutation.mutateAsync(id);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Hồ sơ Bác sĩ</h1>
        <div className="flex gap-4">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              Lịch hẹn
            </Button>
          </Link>
          <Link href="/biolinks">
            <Button variant="outline" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Hồ sơ
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quản lý Hồ sơ Y tế</CardTitle>
          <CardDescription>
            Xin chào {user?.username}! Tạo và quản lý hồ sơ bác sĩ của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4 mb-8"
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Chức danh</Label>
                <Input
                  id="title"
                  value={newBiolink.title}
                  onChange={(e) =>
                    setNewBiolink({ ...newBiolink, title: e.target.value })
                  }
                  placeholder="Bác sĩ Chuyên khoa II"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">
                  Đường dẫn
                  <span className="text-sm text-muted-foreground ml-2">
                    (Ví dụ: nguyen-van-a)
                  </span>
                </Label>
                <Input
                  id="slug"
                  value={newBiolink.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="ten-bac-si"
                  required
                />
                {slugError && (
                  <p className="text-sm text-destructive">{slugError}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Đường dẫn sẽ được sử dụng để tạo link công khai: {window.location.origin}/bio/<span className="font-mono">{newBiolink.slug || "ten-bac-si"}</span>
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Mô tả chuyên môn</Label>
                <Input
                  id="description"
                  value={newBiolink.description}
                  onChange={(e) =>
                    setNewBiolink({ ...newBiolink, description: e.target.value })
                  }
                  placeholder="Chuyên khoa Nội Tổng quát, 15 năm kinh nghiệm"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createBiolinkMutation.isPending || !!slugError}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo Hồ sơ Mới
            </Button>
          </form>

          <div className="grid gap-4">
            {biolinks?.map((biolink) => (
              <Card key={biolink.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{biolink.title}</CardTitle>
                      <CardDescription>{biolink.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(biolink)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(biolink.id)}
                        disabled={deleteBiolinkMutation.isPending}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Đường dẫn công khai: {window.location.origin}/bio/{biolink.slug}
                  </p>

                  <div className="flex gap-2 mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/bio/${biolink.slug}`);
                        toast({
                          title: "Thành công",
                          description: "Đã sao chép đường dẫn.",
                        });
                      }}
                    >
                      Sao chép đường dẫn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/bio/${biolink.slug}`, '_blank')}
                    >
                      Xem trước
                    </Button>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBiolink(biolink)}
                      >
                        Quản lý Liên kết
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Thêm Liên kết Mạng xã hội</DialogTitle>
                        <DialogDescription>
                          Thêm và quản lý các liên kết mạng xã hội cho {biolink.title}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <Select
                          value={newSocialLink.platform}
                          onValueChange={(value: Platform) =>
                            setNewSocialLink({ ...newSocialLink, platform: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nền tảng" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <platform.icon className="w-4 h-4" />
                                  {platform.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {newSocialLink.platform && (
                          <SocialLinkValidator
                            platform={newSocialLink.platform}
                            url={newSocialLink.url}
                            onChange={(url) =>
                              setNewSocialLink({ ...newSocialLink, url })
                            }
                            onValidChange={setIsUrlValid}
                          />
                        )}

                        {socialLinks && socialLinks.length > 0 && (
                          <div className="mt-4">
                            <h4 className="mb-2 font-medium">Liên kết hiện tại</h4>
                            <div className="space-y-2">
                              {socialLinks.map((link) => {
                                const platform = SOCIAL_PLATFORMS[link.platform as Platform];
                                const Icon = platform?.icon;
                                return (
                                  <div
                                    key={link.id}
                                    className="flex items-center gap-2 p-2 rounded-md border"
                                  >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-500 hover:underline"
                                    >
                                      {link.url}
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleAddSocialLink}
                          disabled={!isUrlValid || createSocialLinkMutation.isPending}
                        >
                          Thêm Liên kết
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Biolink Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Hồ sơ</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin hồ sơ bác sĩ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBiolink}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Chức danh</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingBiolink?.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Đường dẫn</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  defaultValue={editingBiolink?.slug}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Mô tả chuyên môn</Label>
                <Input
                  id="edit-description"
                  name="description"
                  defaultValue={editingBiolink?.description}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={updateBiolinkMutation.isPending}
              >
                {updateBiolinkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
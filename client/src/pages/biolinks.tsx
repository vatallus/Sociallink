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
        title: "Success",
        description: "Biolink created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create biolink.",
        variant: "destructive",
      });
    },
  });

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
        title: "Success",
        description: "Biolink updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update biolink.",
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
        title: "Success",
        description: "Social link added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add social link.",
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
        title: "Success",
        description: "Biolink deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete biolink.",
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
    const confirmed = window.confirm("Are you sure you want to delete this biolink?");
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
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Biolinks Management</h1>
        <div className="flex gap-4">
          <Link href="/admin">
            <Button variant="outline" className="flex items-center gap-2">
              Appointments
            </Button>
          </Link>
          <Link href="/biolinks">
            <Button variant="outline" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Biolinks
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Biolink Management</CardTitle>
          <CardDescription>
            Welcome {user?.username}! Create and manage your biolinks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createBiolinkMutation.mutate(newBiolink);
            }}
            className="space-y-4 mb-8"
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newBiolink.title}
                  onChange={(e) =>
                    setNewBiolink({ ...newBiolink, title: e.target.value })
                  }
                  placeholder="My Awesome Biolink"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={newBiolink.slug}
                  onChange={(e) =>
                    setNewBiolink({ ...newBiolink, slug: e.target.value })
                  }
                  placeholder="my-awesome-biolink"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newBiolink.description}
                  onChange={(e) =>
                    setNewBiolink({ ...newBiolink, description: e.target.value })
                  }
                  placeholder="A short description of your biolink"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={createBiolinkMutation.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Biolink
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
                    Slug: {biolink.slug}
                  </p>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBiolink(biolink)}
                      >
                        Manage Social Links
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Social Links</DialogTitle>
                        <DialogDescription>
                          Add and manage social media links for {biolink.title}
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
                            <SelectValue placeholder="Select platform" />
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
                            <h4 className="mb-2 font-medium">Current Links</h4>
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
                          Add Social Link
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
            <DialogTitle>Edit Biolink</DialogTitle>
            <DialogDescription>
              Update your biolink information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBiolink}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingBiolink?.title}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  defaultValue={editingBiolink?.slug}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
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
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateBiolinkMutation.isPending}
              >
                {updateBiolinkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
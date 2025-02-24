import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Biolink } from "@shared/schema";

export default function BiolinksDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [newBiolink, setNewBiolink] = useState({
    title: "",
    description: "",
    slug: "",
  });

  const { data: biolinks, isLoading } = useQuery<Biolink[]>({
    queryKey: ["/api/biolinks"],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBiolinkMutation.mutate(newBiolink);
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
      <Card>
        <CardHeader>
          <CardTitle>Biolink Management</CardTitle>
          <CardDescription>
            Welcome {user?.username}! Create and manage your biolinks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
                  <CardTitle>{biolink.title}</CardTitle>
                  <CardDescription>{biolink.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Slug: {biolink.slug}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      // TODO: Implement edit functionality
                    }}
                  >
                    Manage Social Links
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

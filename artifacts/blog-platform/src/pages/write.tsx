import { useState } from "react";
import { useLocation } from "wouter";
import { useCreatePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Write() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createPost = useCreatePost({
    mutation: {
      onSuccess: (post) => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        toast({ title: "Story published" });
        navigate(`/posts/${post.id}`);
      },
      onError: () => {
        toast({ title: "Failed to publish story", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    createPost.mutate({ data: { title: title.trim(), content: content.trim() } });
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto text-center py-20" data-testid="prompt-login-write">
          <h1 className="font-serif text-4xl font-bold italic mb-4">Ready to write?</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Sign in to share your ideas with readers who care about words.
          </p>
          <Button onClick={login} className="rounded-none font-serif px-10 py-3 text-base" data-testid="btn-signin-write">
            Sign in to continue
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10" data-testid="link-back">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        <h1 className="font-serif text-3xl font-bold mb-10">New Story</h1>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-write">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Story title..."
              className="rounded-none border-0 border-b border-border text-2xl font-serif font-semibold h-auto py-4 px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent placeholder:text-muted-foreground/50"
              data-testid="input-title"
            />
          </div>
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story..."
              className="rounded-none border-0 border-b border-border resize-none min-h-[400px] text-base leading-loose focus-visible:ring-0 focus-visible:border-primary bg-transparent px-0 placeholder:text-muted-foreground/50"
              data-testid="input-content"
            />
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-muted-foreground">
              {content.length > 0 && `${content.split(/\s+/).filter(Boolean).length} words`}
            </span>
            <Button
              type="submit"
              disabled={createPost.isPending || !title.trim() || !content.trim()}
              className="rounded-none font-serif px-8"
              data-testid="btn-publish"
            >
              {createPost.isPending ? "Publishing..." : "Publish story"}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

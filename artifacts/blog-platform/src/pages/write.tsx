import { useState } from "react";
import { useLocation } from "wouter";
import { useCreatePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Feather } from "lucide-react";
import { Link } from "wouter";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import "@/components/editor/editor.css";

export default function Write() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isEmpty = !content || content === "<p></p>" || content.trim() === "";

  const createPost = useCreatePost({
    mutation: {
      onSuccess: (post) => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        toast({ title: "Story published!" });
        navigate(`/posts/${post.id}`);
      },
      onError: () => {
        toast({ title: "Failed to publish story", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isEmpty) return;
    createPost.mutate({ data: { title: title.trim(), content } });
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto text-center py-24" data-testid="prompt-login-write">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Feather className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-3">Ready to write?</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed text-lg">
            Sign in to share your ideas with readers who care about words.
          </p>
          <Button onClick={login} className="rounded-full font-serif px-10 py-3 text-base gap-2" data-testid="btn-signin-write">
            <Feather className="h-4 w-4" />
            Sign in to continue
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group" data-testid="link-back">
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Feather className="h-3 w-3 text-primary" />
            </div>
            <span className="font-serif italic text-sm text-muted-foreground">New Story</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} data-testid="form-write">
          <div className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden">
            {/* Window chrome */}
            <div className="px-4 py-3 bg-muted/30 border-b border-border/40 flex items-center gap-3">
              <div className="flex gap-1.5 ml-1">
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-amber-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
              </div>
              <span className="text-xs text-muted-foreground font-medium flex-1 text-center">
                {title ? `"${title.slice(0, 50)}${title.length > 50 ? "…" : ""}"` : "Untitled story"}
              </span>
            </div>

            {/* Title input */}
            <div className="px-8 pt-8 pb-2 border-b border-border/30">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Your story title..."
                className="border-0 text-3xl font-serif font-bold h-auto py-2 px-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/30 rounded-none"
                data-testid="input-title"
              />
            </div>

            {/* Rich text editor */}
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Tell your story here. Write something the world needs to read..."
            />

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-4 border-t border-border/40 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Use the toolbar above to format headings, bold, quotes, lists and more.
              </p>
              <Button
                type="submit"
                disabled={createPost.isPending || !title.trim() || isEmpty}
                className="rounded-full font-serif px-8 gap-2 shadow-sm"
                data-testid="btn-publish"
              >
                <Send className="h-4 w-4" />
                {createPost.isPending ? "Publishing..." : "Publish story"}
              </Button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your story will be published publicly and visible to all readers.
        </p>
      </div>
    </PageLayout>
  );
}

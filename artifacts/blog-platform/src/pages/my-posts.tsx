import { useState } from "react";
import { Link } from "wouter";
import { useListPosts, useUpdatePost, useDeletePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { PenSquare, Trash2, MessageSquare, ArrowLeft } from "lucide-react";

type PostSummary = {
  id: number;
  title: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
  createdAt: string;
  commentCount: number;
};

export default function MyPosts() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { data: allPosts, isLoading: postsLoading } = useListPosts();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editingPost, setEditingPost] = useState<PostSummary | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const myPosts = allPosts?.filter((p) => p.authorId === user?.id) ?? [];

  const updatePost = useUpdatePost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        setEditingPost(null);
        toast({ title: "Story updated" });
      },
      onError: () => {
        toast({ title: "Failed to update story", variant: "destructive" });
      },
    },
  });

  const deletePost = useDeletePost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        setDeletingId(null);
        toast({ title: "Story deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete story", variant: "destructive" });
      },
    },
  });

  const openEdit = (post: PostSummary) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.excerpt);
  };

  const handleUpdate = () => {
    if (!editingPost || !editTitle.trim() || !editContent.trim()) return;
    updatePost.mutate({ id: editingPost.id, data: { title: editTitle.trim(), content: editContent.trim() } });
  };

  if (isLoading) return null;

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto text-center py-20" data-testid="prompt-login-my-posts">
          <h1 className="font-serif text-4xl font-bold italic mb-4">Your stories</h1>
          <p className="text-muted-foreground mb-8">Sign in to manage your published stories.</p>
          <Button onClick={login} className="rounded-none font-serif px-10" data-testid="btn-signin-my-posts">Sign in</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10" data-testid="link-back">
          <ArrowLeft className="h-3.5 w-3.5" />
          All stories
        </Link>

        <div className="flex items-center justify-between mb-10">
          <h1 className="font-serif text-3xl font-bold">My Stories</h1>
          <Link href="/write">
            <Button variant="outline" className="gap-2 rounded-none font-serif" data-testid="btn-write-new">
              <PenSquare className="h-4 w-4" />
              New Story
            </Button>
          </Link>
        </div>

        {postsLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-border pb-8 space-y-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : myPosts.length > 0 ? (
          <div className="space-y-0">
            {myPosts.map((post) => (
              <article key={post.id} className="border-b border-border py-8 group" data-testid={`my-post-${post.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="font-serif text-xl font-semibold leading-tight mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`text-my-post-title-${post.id}`}>
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3" data-testid={`text-my-post-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => openEdit(post)}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      data-testid={`btn-edit-${post.id}`}
                      aria-label="Edit post"
                    >
                      <PenSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(post.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      data-testid={`btn-delete-${post.id}`}
                      aria-label="Delete post"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20" data-testid="empty-my-posts">
            <p className="font-serif text-2xl text-muted-foreground italic mb-4">No stories yet.</p>
            <p className="text-muted-foreground mb-8">Your published stories will appear here.</p>
            <Link href="/write">
              <Button className="rounded-none font-serif px-8" data-testid="btn-write-first">Write your first story</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl rounded-none" data-testid="dialog-edit">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Edit story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="rounded-none font-serif font-semibold text-lg"
              data-testid="input-edit-title"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Content..."
              className="rounded-none min-h-[300px] resize-none"
              data-testid="input-edit-content"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-none font-serif" onClick={() => setEditingPost(null)} data-testid="btn-cancel-edit">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updatePost.isPending || !editTitle.trim() || !editContent.trim()}
              className="rounded-none font-serif"
              data-testid="btn-save-edit"
            >
              {updatePost.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-none" data-testid="dialog-delete">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The story and all its comments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none font-serif" data-testid="btn-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deletePost.mutate({ id: deletingId })}
              className="rounded-none font-serif bg-destructive hover:bg-destructive/90"
              data-testid="btn-confirm-delete"
            >
              {deletePost.isPending ? "Deleting..." : "Delete story"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { useListPosts, useUpdatePost, useDeletePost, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { PenSquare, Trash2, MessageSquare, ArrowLeft, BookOpen, Feather } from "lucide-react";

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
        <div className="max-w-xl mx-auto text-center py-24" data-testid="prompt-login-my-posts">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-3">Your stories</h1>
          <p className="text-muted-foreground mb-8 text-lg">Sign in to manage your published stories.</p>
          <Button onClick={login} className="rounded-full font-serif px-10" data-testid="btn-signin-my-posts">Sign in</Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group" data-testid="link-back">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All stories
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-1">My Stories</h1>
            <p className="text-sm text-muted-foreground">{myPosts.length} {myPosts.length === 1 ? "story" : "stories"} published</p>
          </div>
          <Link href="/write">
            <Button className="gap-2 rounded-full font-medium shadow-sm" data-testid="btn-write-new">
              <Feather className="h-3.5 w-3.5" />
              New Story
            </Button>
          </Link>
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
                <Skeleton className="h-5 w-2/3 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-1/2 rounded-lg" />
              </div>
            ))}
          </div>
        ) : myPosts.length > 0 ? (
          <div className="space-y-4">
            {myPosts.map((post, idx) => (
              <article
                key={post.id}
                className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/25 hover:shadow-sm transition-all group"
                data-testid={`my-post-${post.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="rounded-full text-xs bg-green-500/10 text-green-700 border-0 font-medium">
                        Published
                      </Badge>
                      {idx === 0 && (
                        <Badge variant="secondary" className="rounded-full text-xs bg-primary/10 text-primary border-0 font-medium">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="font-serif text-xl font-semibold leading-tight mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`text-my-post-title-${post.id}`}>
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed" data-testid={`text-my-post-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.commentCount} {post.commentCount === 1 ? "comment" : "comments"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(post)}
                      className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                      data-testid={`btn-edit-${post.id}`}
                      aria-label="Edit post"
                    >
                      <PenSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(post.id)}
                      className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
          <div className="text-center py-24 bg-card border border-border/60 rounded-2xl" data-testid="empty-my-posts">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Feather className="h-6 w-6 text-primary" />
            </div>
            <p className="font-serif text-2xl font-semibold mb-2">No stories yet.</p>
            <p className="text-muted-foreground mb-8">Your published stories will appear here.</p>
            <Link href="/write">
              <Button className="rounded-full font-serif px-8 gap-2" data-testid="btn-write-first">
                <Feather className="h-4 w-4" /> Write your first story
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl rounded-2xl" data-testid="dialog-edit">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <PenSquare className="h-4 w-4 text-primary" />
              Edit story
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              className="rounded-xl font-serif font-semibold text-lg border-border/60 focus-visible:border-primary/50"
              data-testid="input-edit-title"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Content..."
              className="rounded-xl min-h-[300px] resize-none border-border/60 focus-visible:border-primary/50 leading-relaxed"
              data-testid="input-edit-content"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full font-serif" onClick={() => setEditingPost(null)} data-testid="btn-cancel-edit">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updatePost.isPending || !editTitle.trim() || !editContent.trim()}
              className="rounded-full font-serif"
              data-testid="btn-save-edit"
            >
              {updatePost.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-2xl" data-testid="dialog-delete">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete this story?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The story and all its comments will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full font-serif" data-testid="btn-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deletePost.mutate({ id: deletingId })}
              className="rounded-full font-serif bg-destructive hover:bg-destructive/90"
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

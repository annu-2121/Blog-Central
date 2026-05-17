import { useRoute, useLocation } from "wouter";
import { useGetPost, useListComments, useCreateComment, useDeleteComment, getGetPostQueryKey, getListCommentsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PostDetail() {
  const [, params] = useRoute("/posts/:id");
  const postId = params ? Number(params.id) : 0;
  const { user, isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [, navigate] = useLocation();

  const { data: post, isLoading: postLoading } = useGetPost(postId, {
    query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) },
  });
  const { data: comments, isLoading: commentsLoading } = useListComments(postId, {
    query: { enabled: !!postId, queryKey: getListCommentsQueryKey(postId) },
  });

  const createComment = useCreateComment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        setComment("");
        toast({ title: "Comment added" });
      },
      onError: () => {
        toast({ title: "Failed to add comment", variant: "destructive" });
      },
    },
  });

  const deleteComment = useDeleteComment({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
        toast({ title: "Comment deleted" });
      },
      onError: () => {
        toast({ title: "Failed to delete comment", variant: "destructive" });
      },
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    createComment.mutate({ id: postId, data: { content: comment.trim() } });
  };

  if (postLoading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-3 items-center">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-3 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <p className="font-serif text-2xl text-muted-foreground italic">Story not found.</p>
          <Link href="/" className="mt-6 inline-block">
            <Button variant="outline" className="rounded-none font-serif gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to stories
            </Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10" data-testid="link-back">
          <ArrowLeft className="h-3.5 w-3.5" />
          All stories
        </Link>

        {/* Post header */}
        <header className="mb-10 pb-10 border-b border-border">
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6" data-testid="text-post-title">
            {post.title}
          </h1>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.authorImageUrl || ""} alt={post.authorName} />
              <AvatarFallback className="font-serif bg-secondary">{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm" data-testid="text-author">{post.authorName}</p>
              <p className="text-xs text-muted-foreground" data-testid="text-date">{formatDate(post.createdAt)}</p>
            </div>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose prose-lg max-w-none mb-16 font-sans leading-relaxed text-foreground
            prose-headings:font-serif prose-headings:text-foreground
            prose-p:text-foreground prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          data-testid="text-post-content"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {post.content}
        </div>

        {/* Comments section */}
        <section className="border-t border-border pt-12">
          <h2 className="font-serif text-2xl font-semibold mb-8 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-primary" />
            {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
          </h2>

          {/* Add comment */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-10 space-y-3" data-testid="form-comment">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="text-xs font-serif bg-secondary">
                    {user?.firstName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a thoughtful comment..."
                    className="min-h-[100px] rounded-none resize-none border-border focus:border-primary"
                    data-testid="input-comment"
                  />
                  <Button
                    type="submit"
                    disabled={createComment.isPending || !comment.trim()}
                    className="rounded-none font-serif"
                    data-testid="btn-submit-comment"
                  >
                    {createComment.isPending ? "Posting..." : "Post comment"}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-10 p-6 border border-border bg-muted/30 text-center" data-testid="prompt-login-comment">
              <p className="font-serif italic text-muted-foreground mb-4">Join the conversation.</p>
              <Button onClick={login} className="rounded-none font-serif" data-testid="btn-login-comment">
                Sign in to comment
              </Button>
            </div>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-8">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3" data-testid={`comment-${c.id}`}>
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={c.authorImageUrl || ""} alt={c.authorName} />
                    <AvatarFallback className="text-xs font-serif bg-secondary">
                      {c.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm" data-testid={`text-comment-author-${c.id}`}>{c.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                      </div>
                      {user && user.id === c.authorId && (
                        <button
                          onClick={() => deleteComment.mutate({ id: c.id })}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          data-testid={`btn-delete-comment-${c.id}`}
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90" data-testid={`text-comment-content-${c.id}`}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground" data-testid="empty-comments">
              <p className="font-serif italic">No comments yet. Be the first.</p>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

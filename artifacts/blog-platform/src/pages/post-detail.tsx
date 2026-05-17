import { useRoute, useLocation } from "wouter";
import { useGetPost, useListComments, useCreateComment, useDeleteComment, getGetPostQueryKey, getListCommentsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/layout/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, readingTime } from "@/lib/utils";
import { MessageSquare, Trash2, ArrowLeft, Clock, Send } from "lucide-react";
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
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-3/4 rounded-xl" />
          <div className="flex gap-3 items-center">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-48 rounded-lg" />
          </div>
          <div className="space-y-3 pt-6">
            {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-4 w-full rounded-lg" />)}
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout>
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="font-serif text-2xl font-semibold mb-2">Story not found.</p>
          <p className="text-muted-foreground mb-8">This story may have been removed or doesn't exist.</p>
          <Link href="/">
            <Button variant="outline" className="rounded-full font-serif gap-2">
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
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group" data-testid="link-back">
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          All stories
        </Link>

        {/* Post header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="rounded-full text-xs bg-primary/10 text-primary border-0 font-medium">
              Story
            </Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium tracking-wide">
              <Clock className="h-3 w-3" />
              {readingTime(post.content)} min read
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6" data-testid="text-post-title">
            {post.title}
          </h1>

          {/* Author bar */}
          <div className="flex items-center gap-4 py-4 border-y border-border/50">
            <Avatar className="h-11 w-11 border-2 border-primary/15">
              <AvatarImage src={post.authorImageUrl || ""} alt={post.authorName} />
              <AvatarFallback className="font-serif bg-primary/10 text-primary">{post.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm" data-testid="text-author">{post.authorName}</p>
              <p className="text-xs text-muted-foreground" data-testid="text-date">{formatDate(post.createdAt)}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{post.commentCount}</span>
            </div>
          </div>
        </header>

        {/* Post content */}
        <div
          className="prose prose-lg max-w-none mb-16
            prose-headings:font-serif prose-headings:text-foreground
            prose-p:text-foreground/90 prose-p:leading-[1.85]
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            prose-strong:text-foreground
            font-sans text-[1.05rem] leading-[1.85]"
          data-testid="text-post-content"
          style={{ whiteSpace: "pre-wrap" }}
        >
          {post.content}
        </div>

        {/* Author card at bottom */}
        <div className="bg-card border border-border/60 rounded-2xl p-6 mb-12 flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/15">
            <AvatarImage src={post.authorImageUrl || ""} alt={post.authorName} />
            <AvatarFallback className="font-serif text-lg bg-primary/10 text-primary">{post.authorName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase mb-1">Written by</p>
            <p className="font-serif font-semibold text-lg">{post.authorName}</p>
          </div>
        </div>

        {/* Comments section */}
        <section className="border-t border-border/50 pt-12">
          <h2 className="font-serif text-2xl font-semibold mb-8 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
          </h2>

          {/* Add comment */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="mb-10" data-testid="form-comment">
              <div className="flex gap-3">
                <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5 border border-border">
                  <AvatarImage src={user?.profileImageUrl || ""} />
                  <AvatarFallback className="text-xs font-serif bg-primary/10 text-primary">
                    {user?.firstName?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-card border border-border/60 rounded-2xl overflow-hidden focus-within:border-primary/40 transition-colors">
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share a thoughtful response..."
                    className="min-h-[100px] rounded-none border-0 resize-none bg-transparent focus-visible:ring-0 px-4 pt-4 text-sm"
                    data-testid="input-comment"
                  />
                  <div className="flex justify-end px-4 py-3 border-t border-border/40 bg-muted/20">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={createComment.isPending || !comment.trim()}
                      className="rounded-full font-medium gap-2"
                      data-testid="btn-submit-comment"
                    >
                      <Send className="h-3.5 w-3.5" />
                      {createComment.isPending ? "Posting..." : "Post comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="mb-10 p-8 bg-card border border-border/60 rounded-2xl text-center" data-testid="prompt-login-comment">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <p className="font-serif text-lg font-semibold mb-1">Join the conversation</p>
              <p className="text-sm text-muted-foreground mb-5">Sign in to share your thoughts on this story.</p>
              <Button onClick={login} className="rounded-full font-serif px-8" data-testid="btn-login-comment">
                Sign in to comment
              </Button>
            </div>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 bg-card border border-border/50 rounded-2xl p-5">
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3 bg-card border border-border/50 rounded-2xl p-5 group" data-testid={`comment-${c.id}`}>
                  <Avatar className="h-9 w-9 flex-shrink-0 border border-border">
                    <AvatarImage src={c.authorImageUrl || ""} alt={c.authorName} />
                    <AvatarFallback className="text-xs font-serif bg-primary/10 text-primary">
                      {c.authorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm" data-testid={`text-comment-author-${c.id}`}>{c.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(c.createdAt)}</span>
                      </div>
                      {user && user.id === c.authorId && (
                        <button
                          onClick={() => deleteComment.mutate({ id: c.id })}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          data-testid={`btn-delete-comment-${c.id}`}
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/85" data-testid={`text-comment-content-${c.id}`}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-border/50 rounded-2xl" data-testid="empty-comments">
              <p className="font-serif italic text-muted-foreground">No comments yet. Be the first to respond.</p>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

import { Link } from "wouter";
import { useListPosts, useGetPostStats, getListPostsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { PageLayout } from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Users, FileText, PenSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: posts, isLoading: postsLoading } = useListPosts();
  const { data: stats } = useGetPostStats();
  const { isAuthenticated, login } = useAuth();

  return (
    <PageLayout>
      <div className="space-y-16">
        {/* Hero */}
        <section className="border-b border-border pb-12">
          <h1 className="font-serif text-5xl md:text-6xl font-bold italic leading-tight mb-4">
            A quiet place<br />for serious ideas.
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Write with intention. Read with care. Join a community of writers who believe that words still matter.
          </p>
          {!isAuthenticated && (
            <Button onClick={login} className="mt-8 font-serif px-8 py-3 text-base rounded-none" data-testid="btn-get-started">
              Start Writing
            </Button>
          )}
        </section>

        {/* Stats */}
        {stats && (
          <section className="grid grid-cols-3 gap-8 border-b border-border pb-12" data-testid="section-stats">
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary" data-testid="stat-posts">{stats.totalPosts}</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
                <FileText className="h-3.5 w-3.5" />
                Stories
              </div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary" data-testid="stat-comments">{stats.totalComments}</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MessageSquare className="h-3.5 w-3.5" />
                Comments
              </div>
            </div>
            <div className="text-center">
              <div className="font-serif text-4xl font-bold text-primary" data-testid="stat-authors">{stats.totalAuthors}</div>
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Users className="h-3.5 w-3.5" />
                Writers
              </div>
            </div>
          </section>
        )}

        {/* Posts Feed */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-2xl font-semibold">Latest Stories</h2>
            {isAuthenticated && (
              <Link href="/write">
                <Button variant="outline" className="gap-2 rounded-none font-serif" data-testid="btn-write-new">
                  <PenSquare className="h-4 w-4" />
                  New Story
                </Button>
              </Link>
            )}
          </div>

          {postsLoading ? (
            <div className="space-y-10">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-border pb-10 space-y-3">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4 pt-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="space-y-0">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="border-b border-border py-10 group"
                  data-testid={`card-post-${post.id}`}
                >
                  <Link href={`/posts/${post.id}`}>
                    <h3 className="font-serif text-2xl font-semibold leading-tight mb-3 group-hover:text-primary transition-colors cursor-pointer" data-testid={`text-post-title-${post.id}`}>
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-5" data-testid={`text-post-excerpt-${post.id}`}>
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={post.authorImageUrl || ""} alt={post.authorName} />
                      <AvatarFallback className="text-xs font-serif bg-secondary">
                        {post.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium" data-testid={`text-author-${post.id}`}>{post.authorName}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="text-sm text-muted-foreground" data-testid={`text-date-${post.id}`}>{formatDate(post.createdAt)}</span>
                    <span className="text-muted-foreground text-xs">·</span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground" data-testid={`text-comments-${post.id}`}>
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.commentCount}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center" data-testid="empty-posts">
              <p className="font-serif text-2xl text-muted-foreground italic mb-4">No stories yet.</p>
              <p className="text-muted-foreground mb-8">Be the first to share something worth reading.</p>
              {isAuthenticated ? (
                <Link href="/write">
                  <Button className="rounded-none font-serif px-8" data-testid="btn-write-first">Write the first story</Button>
                </Link>
              ) : (
                <Button onClick={login} className="rounded-none font-serif px-8" data-testid="btn-login-write">Sign in to write</Button>
              )}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}

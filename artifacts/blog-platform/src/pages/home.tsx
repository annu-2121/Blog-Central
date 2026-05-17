import { Link } from "wouter";
import { useListPosts, useGetPostStats } from "@workspace/api-client-react";
import { useAuth } from "@workspace/replit-auth-web";
import { PageLayout } from "@/components/layout/PageLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, readingTime } from "@/lib/utils";
import { MessageSquare, Users, FileText, PenSquare, ArrowRight, Clock, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { data: posts, isLoading: postsLoading } = useListPosts();
  const { data: stats } = useGetPostStats();
  const { isAuthenticated, login } = useAuth();

  const featuredPost = posts?.[0];
  const restPosts = posts?.slice(1) ?? [];

  return (
    <PageLayout>
      {/* Hero */}
      <section className="hero-pattern relative overflow-hidden rounded-2xl bg-card border border-border/60 px-8 md:px-14 py-14 md:py-20 mb-12 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/8 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full mb-6">
            <TrendingUp className="h-3 w-3" />
            Welcome to Pencraft
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
            <span className="italic">A quiet place</span><br />
            <span className="text-gradient">for serious ideas.</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg leading-relaxed mb-8">
            Write with intention. Read with care. Join a community of writers who believe that words still matter.
          </p>
          {!isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={login} className="font-serif px-8 py-3 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all gap-2" data-testid="btn-get-started">
                Start Writing
                <ArrowRight className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Free to join. No algorithms.</span>
            </div>
          ) : (
            <Link href="/write">
              <Button className="font-serif px-8 py-3 text-base rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md gap-2" data-testid="btn-get-started">
                <PenSquare className="h-4 w-4" />
                New Story
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="grid grid-cols-3 gap-4 mb-12" data-testid="section-stats">
          {[
            { value: stats.totalPosts, label: "Stories", icon: FileText, testId: "stat-posts" },
            { value: stats.totalComments, label: "Comments", icon: MessageSquare, testId: "stat-comments" },
            { value: stats.totalAuthors, label: "Writers", icon: Users, testId: "stat-authors" },
          ].map(({ value, label, icon: Icon, testId }) => (
            <div key={label} className="bg-card border border-border/60 rounded-2xl p-5 text-center hover:border-primary/30 transition-colors shadow-sm">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="font-serif text-3xl font-bold text-foreground mb-1" data-testid={testId}>{value}</div>
              <div className="text-xs text-muted-foreground font-medium tracking-wide uppercase">{label}</div>
            </div>
          ))}
        </section>
      )}

      {/* Feed */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl font-semibold flex items-center gap-3">
            Latest Stories
            <span className="text-sm font-sans font-normal text-muted-foreground">{posts?.length ?? 0} published</span>
          </h2>
          {isAuthenticated && (
            <Link href="/write">
              <Button variant="outline" size="sm" className="gap-2 rounded-full font-medium border-border hover:border-primary/40 hover:bg-primary/5" data-testid="btn-write-new">
                <PenSquare className="h-3.5 w-3.5" />
                Write
              </Button>
            </Link>
          )}
        </div>

        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border/60 rounded-2xl p-6 space-y-3">
                <Skeleton className="h-6 w-3/4 rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3 rounded-lg" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-36 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-4">
            {/* Featured first post */}
            {featuredPost && (
              <article
                className="bg-card border border-border/60 rounded-2xl p-7 card-hover group shadow-sm hover:shadow-md hover:border-primary/25"
                data-testid={`card-post-${featuredPost.id}`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="rounded-full text-xs bg-primary/10 text-primary border-0 font-medium">
                    ✦ Featured
                  </Badge>
                  <span className="reading-time text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {readingTime(featuredPost.excerpt)} min read
                  </span>
                </div>
                <Link href={`/posts/${featuredPost.id}`}>
                  <h3 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors cursor-pointer" data-testid={`text-post-title-${featuredPost.id}`}>
                    {featuredPost.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-5 text-base" data-testid={`text-post-excerpt-${featuredPost.id}`}>
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={featuredPost.authorImageUrl || ""} alt={featuredPost.authorName} />
                      <AvatarFallback className="text-xs font-serif bg-primary/10 text-primary">
                        {featuredPost.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-sm font-semibold" data-testid={`text-author-${featuredPost.id}`}>{featuredPost.authorName}</span>
                      <span className="text-muted-foreground text-xs block" data-testid={`text-date-${featuredPost.id}`}>{formatDate(featuredPost.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1" data-testid={`text-comments-${featuredPost.id}`}>
                      <MessageSquare className="h-3.5 w-3.5" />
                      {featuredPost.commentCount}
                    </span>
                    <Link href={`/posts/${featuredPost.id}`}>
                      <span className="flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all text-sm">
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* Rest of posts */}
            {restPosts.map((post) => (
              <article
                key={post.id}
                className="bg-card border border-border/60 rounded-2xl p-6 card-hover group shadow-sm hover:shadow-md hover:border-primary/25"
                data-testid={`card-post-${post.id}`}
              >
                <div className="flex items-start gap-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="reading-time text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {readingTime(post.excerpt)} min read
                      </span>
                    </div>
                    <Link href={`/posts/${post.id}`}>
                      <h3 className="font-serif text-xl font-semibold leading-tight mb-2 group-hover:text-primary transition-colors cursor-pointer" data-testid={`text-post-title-${post.id}`}>
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4" data-testid={`text-post-excerpt-${post.id}`}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-6 w-6 border border-border">
                        <AvatarImage src={post.authorImageUrl || ""} alt={post.authorName} />
                        <AvatarFallback className="text-[10px] font-serif bg-primary/10 text-primary">
                          {post.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium" data-testid={`text-author-${post.id}`}>{post.authorName}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-xs text-muted-foreground" data-testid={`text-date-${post.id}`}>{formatDate(post.createdAt)}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`text-comments-${post.id}`}>
                        <MessageSquare className="h-3 w-3" />
                        {post.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-card border border-border/60 rounded-2xl" data-testid="empty-posts">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <PenSquare className="h-6 w-6 text-primary" />
            </div>
            <p className="font-serif text-2xl font-semibold mb-2">No stories yet.</p>
            <p className="text-muted-foreground mb-8">Be the first to share something worth reading.</p>
            {isAuthenticated ? (
              <Link href="/write">
                <Button className="rounded-full font-serif px-8 gap-2" data-testid="btn-write-first">
                  <PenSquare className="h-4 w-4" /> Write the first story
                </Button>
              </Link>
            ) : (
              <Button onClick={login} className="rounded-full font-serif px-8" data-testid="btn-login-write">Sign in to write</Button>
            )}
          </div>
        )}
      </section>
    </PageLayout>
  );
}

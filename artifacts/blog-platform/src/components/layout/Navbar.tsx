import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { BookOpen, PenSquare, LogOut, User as UserIcon, Feather } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  return (
    <header className="border-b border-border/50 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sticky top-0 z-50">
      <div className="container mx-auto px-6 max-w-6xl h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Feather className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-serif text-xl font-bold italic tracking-tight group-hover:text-primary transition-colors">
            Pencraft
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link href="/write">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full px-4">
                      <PenSquare className="h-3.5 w-3.5" />
                      Write
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                        <Avatar className="h-9 w-9 rounded-full border-2 border-primary/20 hover:border-primary/50 transition-colors">
                          <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                          <AvatarFallback className="bg-primary/10 text-primary font-serif text-sm">
                            {user?.firstName?.charAt(0) || <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl shadow-lg" align="end" forceMount>
                      <div className="flex flex-col space-y-1 p-3 bg-primary/5 rounded-t-xl">
                        <p className="text-sm font-semibold font-serif">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg my-1 mx-1">
                        <Link href="/my-posts" className="w-full flex items-center">
                          <BookOpen className="mr-2 h-4 w-4 text-primary/70" />
                          <span>My Stories</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer rounded-lg mb-1 mx-1">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={login} className="font-serif px-6 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  Sign In
                </Button>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

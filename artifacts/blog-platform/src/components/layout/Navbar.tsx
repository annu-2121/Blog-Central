import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { BookOpen, PenSquare, LogOut, User as UserIcon } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-5xl h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-bold italic tracking-tight hover:opacity-80 transition-opacity">
          Pencraft.
        </Link>

        <nav className="flex items-center gap-4">
          {!isLoading && (
            <>
              {isAuthenticated ? (
                <>
                  <Link href="/write" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
                    <PenSquare className="h-4 w-4" />
                    Write
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8 rounded-full border border-border">
                          <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground font-serif">
                            {user?.firstName?.charAt(0) || <UserIcon className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <div className="flex flex-col space-y-1 p-2">
                        <p className="text-sm font-medium leading-none font-serif">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my-posts" className="w-full cursor-pointer flex items-center">
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>My Stories</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={login} variant="default" className="font-serif px-6 rounded-none">
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

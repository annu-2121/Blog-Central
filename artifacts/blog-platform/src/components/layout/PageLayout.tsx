import { Navbar } from "./Navbar";
import { Feather } from "lucide-react";
import { Link } from "wouter";

export function PageLayout({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className={`flex-1 w-full ${fullWidth ? "" : "max-w-5xl mx-auto px-6 py-12 md:py-16"}`}>
        {children}
      </main>
      <footer className="py-10 border-t border-border/50 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Feather className="h-3 w-3 text-primary" />
            </div>
            <span className="font-serif italic text-lg font-semibold">Pencraft</span>
          </div>
          <p className="text-sm text-muted-foreground">A quiet place for serious ideas.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/write" className="hover:text-foreground transition-colors">Write</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

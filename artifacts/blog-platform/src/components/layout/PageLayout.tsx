import { Navbar } from "./Navbar";

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 md:py-20">
        {children}
      </main>
      <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
          <span className="font-serif italic text-lg">Pencraft</span>
          <p>A quiet place for serious ideas.</p>
        </div>
      </footer>
    </div>
  );
}

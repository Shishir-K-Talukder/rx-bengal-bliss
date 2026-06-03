import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const MarketingHeader = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <span className="text-lg font-serif italic text-primary-foreground font-bold">℞</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-foreground text-base">Digital Rx</span>
            <span className="text-[10px] text-muted-foreground -mt-0.5">Smart Prescriptions</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) =>
            l.href.startsWith("#") ? (
              <a key={l.href} href={l.href} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </a>
            ) : (
              <Link key={l.href} to={l.href} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button size="sm" onClick={() => navigate("/app")} className="gap-1.5">
              <LayoutDashboard className="w-4 h-4" /> Open App
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate("/login")} className="gap-1.5">
                <LogIn className="w-4 h-4" /> Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="hidden sm:inline-flex">
                Get started
              </Button>
            </>
          )}
          <Button size="icon" variant="ghost" className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
            {links.map((l) =>
              l.href.startsWith("#") ? (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} to={l.href} onClick={() => setOpen(false)} className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                  {l.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketingHeader;

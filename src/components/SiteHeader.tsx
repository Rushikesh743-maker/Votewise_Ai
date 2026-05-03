import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Vote, Moon, Sun, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/flow", label: "Flow" },
  { to: "/learn", label: "Chat" },
  { to: "/simulate", label: "Simulate" },
  { to: "/quiz", label: "Quiz" },
];

export const SiteHeader = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-hero shadow-soft">
            <Vote className="h-5 w-5 text-primary-foreground" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold">VoteWise AI</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Election Learning Assistant
            </span>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {session ? (
            <Button variant="outline" size="sm" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-hero">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

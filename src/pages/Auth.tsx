import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/dashboard", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/dashboard", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const signIn = async () => {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      toast.error("Could not sign in. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container grid place-items-center py-20">
        <section className="w-full max-w-md rounded-2xl border border-border/80 bg-card-soft p-8 shadow-soft text-center">
          <h1 className="font-display text-2xl font-bold">Sign in to VoteWise AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue with Google to track your quiz history and progress.
          </p>
          <Button
            onClick={signIn}
            disabled={loading}
            className="mt-6 w-full bg-hero"
            aria-label="Sign in with Google"
          >
            {loading ? "Redirecting…" : "Continue with Google"}
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Auth;

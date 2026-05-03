import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare, Vote, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import hero from "@/assets/hero-vote.jpg";

const features = [
  {
    icon: MessageSquare,
    title: "Chat with the Election Assistant",
    desc: "Ask anything about voter registration, EVMs, VVPAT, NOTA, polling booths and more — get instant, structured answers.",
    to: "/learn",
    cta: "Start chatting",
  },
  {
    icon: Vote,
    title: "Simulate the Voting Process",
    desc: "Experience a guided mock election: check eligibility, fill voter details, and cast a practice vote in a safe sandbox.",
    to: "/simulate",
    cta: "Try simulation",
  },
  {
    icon: Brain,
    title: "Test Your Civic Knowledge",
    desc: "Take a short quiz on the election process. Get instant scoring, explanations, and learn while you play.",
    to: "/quiz",
    cta: "Take the quiz",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="container grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
            <div className="flex flex-col justify-center">
              <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Civic education, reinvented
              </span>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
                Learn the <span className="bg-hero bg-clip-text text-transparent">election process</span> by doing it.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                VoteWise AI is an interactive learning assistant. Chat about elections,
                simulate the voting flow end-to-end, and quiz yourself — all in one place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-hero text-primary-foreground shadow-elegant hover:opacity-95">
                  <Link to="/simulate">
                    Start the simulation <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/learn">Ask the assistant</Link>
                </Button>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                {[
                  { k: "8+", v: "Quiz topics" },
                  { k: "3", v: "Learning modes" },
                  { k: "100%", v: "Free & open" },
                ].map((s) => (
                  <div key={s.v}>
                    <dt className="font-display text-2xl font-bold text-primary">{s.k}</dt>
                    <dd className="text-xs uppercase tracking-wider text-muted-foreground">{s.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-hero opacity-20 blur-3xl" />
              <img
                src={hero}
                alt="Diverse voters at a modern polling booth illustration"
                className="w-full rounded-2xl shadow-elegant"
                loading="eager"
              />
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border/60 bg-secondary/30 py-20">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold md:text-4xl">Three ways to learn</h2>
              <p className="mt-3 text-muted-foreground">
                Pick your path. Every mode is designed to teach the election process clearly,
                with no political bias.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <Link
                  key={f.title}
                  to={f.to}
                  className="group rounded-2xl border border-border/80 bg-card-soft p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
                >
                  <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {f.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          VoteWise AI · Built for civic learning · {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

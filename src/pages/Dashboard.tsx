import { Link } from "react-router-dom";
import { MessageSquare, Vote, Brain, GitBranch, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

const tiles = [
  { to: "/flow", icon: GitBranch, title: "Election Flow", desc: "Visual step-by-step walkthrough of the election process." },
  { to: "/learn", icon: MessageSquare, title: "AI Chat", desc: "Ask the assistant anything about elections." },
  { to: "/simulate", icon: Vote, title: "Voting Simulation", desc: "Practice the full voting flow safely." },
  { to: "/quiz", icon: Brain, title: "Civic Quiz", desc: "Test your knowledge with instant feedback." },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="text-muted-foreground">Jump into any learning mode.</p>
        </header>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="group rounded-2xl border border-border/80 bg-card-soft p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t.title}
            >
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <h2 className="font-display text-lg font-semibold">{t.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import { useState } from "react";
import { Check, ChevronRight, UserPlus, ShieldCheck, FileSignature, Megaphone, Vote, Calculator, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    key: "registration",
    title: "Registration",
    icon: UserPlus,
    desc: "Eligible citizens (18+) enroll on the electoral roll via Form 6 — online or at the local Electoral Registration Officer.",
  },
  {
    key: "verification",
    title: "Verification",
    icon: ShieldCheck,
    desc: "Election officials verify identity, age and address. Approved voters receive an EPIC (Voter ID).",
  },
  {
    key: "nomination",
    title: "Nomination",
    icon: FileSignature,
    desc: "Candidates file nomination papers with the Returning Officer along with affidavits and security deposits.",
  },
  {
    key: "campaigning",
    title: "Campaigning",
    icon: Megaphone,
    desc: "Candidates and parties campaign within the Model Code of Conduct. Campaigning ends 48 hours before polling.",
  },
  {
    key: "voting",
    title: "Voting",
    icon: Vote,
    desc: "Voters visit assigned polling booths, get verified, and cast a secret ballot using EVMs with VVPAT.",
  },
  {
    key: "counting",
    title: "Counting",
    icon: Calculator,
    desc: "EVM votes are counted at designated centers under observation. VVPAT slips are tallied in random booths for audit.",
  },
  {
    key: "results",
    title: "Results",
    icon: Trophy,
    desc: "The Returning Officer declares the winning candidate. The Election Commission notifies official results.",
  },
];

const Flow = () => {
  const [active, setActive] = useState(0);
  const progress = ((active + 1) / STEPS.length) * 100;
  const Step = STEPS[active];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container py-10">
        <header className="mb-8 max-w-2xl">
          <h1 className="font-display text-3xl font-bold md:text-4xl">The Election Flow</h1>
          <p className="mt-2 text-muted-foreground">
            Click any step to learn what happens at that stage of the process.
          </p>
        </header>

        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Step {active + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-hero transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Steps strip */}
        <ol className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {STEPS.map((s, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <li key={s.key}>
                <button
                  onClick={() => setActive(i)}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "flex w-full flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "border-primary bg-primary/10 shadow-soft"
                      : "border-border/80 bg-card-soft hover:-translate-y-0.5 hover:shadow-soft"
                  )}
                >
                  <span className={cn(
                    "grid h-9 w-9 place-items-center rounded-full",
                    isDone ? "bg-success text-success-foreground" : isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  )}>
                    {isDone ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </span>
                  <span className="text-xs font-medium">{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Detail */}
        <article className="rounded-2xl border border-border/80 bg-card-soft p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
              <Step.icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Stage {active + 1}</p>
              <h2 className="font-display text-2xl font-bold">{Step.title}</h2>
            </div>
          </div>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{Step.desc}</p>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setActive((i) => Math.max(0, i - 1))}
              disabled={active === 0}
              className="rounded-md border border-border/80 px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setActive((i) => Math.min(STEPS.length - 1, i + 1))}
              disabled={active === STEPS.length - 1}
              className="inline-flex items-center gap-1 rounded-md bg-hero px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </article>
      </main>
    </div>
  );
};

export default Flow;

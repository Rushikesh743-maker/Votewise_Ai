import { useState } from "react";
import { CheckCircle2, XCircle, Vote as VoteIcon } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const voterSchema = z.object({
  fullName: z.string().trim().min(1, "Name required").max(100),
  age: z.coerce.number().min(0).max(130),
  voterId: z.string().trim().min(4, "Voter ID must be 4+ chars").max(30),
  constituency: z.string().trim().min(2).max(100),
  isCitizen: z.boolean(),
});

type VoterForm = z.infer<typeof voterSchema>;

const CANDIDATES = [
  { name: "Asha Verma", party: "Civic Front" },
  { name: "Rohan Iyer", party: "Progress Alliance" },
  { name: "Mei Tan", party: "Green Coalition" },
  { name: "NOTA", party: "None of the Above" },
];

type Step = 1 | 2 | 3 | 4;

const Simulate = () => {
  const [step, setStep] = useState<Step>(1);
  const [voter, setVoter] = useState<VoterForm>({
    fullName: "",
    age: 18,
    voterId: "",
    constituency: "",
    isCitizen: true,
  });
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reasons: string[] } | null>(null);
  const [candidate, setCandidate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ id: string; candidate: string } | null>(null);

  const checkAndProceed = async () => {
    const parsed = voterSchema.safeParse(voter);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("simulation-submit", {
        body: { mode: "check", voter: parsed.data },
      });
      if (error) throw error;
      setEligibility(data);
      setStep(data.eligible ? 3 : 2);
    } catch {
      toast.error("Could not check eligibility");
    } finally {
      setSubmitting(false);
    }
  };

  const castVote = async () => {
    if (!candidate) return toast.error("Select a candidate");
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("simulation-submit", {
        body: { voter, candidate, party: CANDIDATES.find((c) => c.name === candidate)?.party },
      });
      if (error) throw error;
      setDone({ id: data.id, candidate: data.candidate });
      setStep(4);
    } catch {
      toast.error("Could not record your vote");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setEligibility(null);
    setCandidate("");
    setDone(null);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-3xl py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Voting Simulation</h1>
          <p className="text-muted-foreground">
            A guided mock election. No real votes are cast — this is for learning only.
          </p>
        </div>

        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-4 gap-2 text-xs font-medium">
          {["Voter details", "Eligibility", "Cast vote", "Done"].map((label, i) => {
            const idx = (i + 1) as Step;
            const active = step >= idx;
            return (
              <li
                key={label}
                className={`rounded-lg border px-3 py-2 text-center ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border/80 bg-secondary/40 text-muted-foreground"
                }`}
              >
                {i + 1}. {label}
              </li>
            );
          })}
        </ol>

        <div className="rounded-2xl border border-border/80 bg-card-soft p-6 shadow-soft">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold">Step 1 — Voter details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={voter.fullName}
                    onChange={(e) => setVoter({ ...voter, fullName: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    min={0}
                    max={130}
                    value={voter.age}
                    onChange={(e) => setVoter({ ...voter, age: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="voterId">Voter ID</Label>
                  <Input
                    id="voterId"
                    value={voter.voterId}
                    onChange={(e) => setVoter({ ...voter, voterId: e.target.value })}
                    maxLength={30}
                    placeholder="e.g. ABC1234"
                  />
                </div>
                <div>
                  <Label htmlFor="constituency">Constituency</Label>
                  <Input
                    id="constituency"
                    value={voter.constituency}
                    onChange={(e) => setVoter({ ...voter, constituency: e.target.value })}
                    maxLength={100}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 sm:col-span-2">
                  <div>
                    <Label className="text-base">I am a citizen</Label>
                    <p className="text-xs text-muted-foreground">Citizenship is required to vote.</p>
                  </div>
                  <Switch
                    checked={voter.isCitizen}
                    onCheckedChange={(v) => setVoter({ ...voter, isCitizen: v })}
                  />
                </div>
              </div>
              <Button onClick={checkAndProceed} disabled={submitting} className="bg-hero">
                Check eligibility
              </Button>
            </div>
          )}

          {step === 2 && eligibility && !eligibility.eligible && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <XCircle className="h-7 w-7 text-destructive" />
                <h2 className="font-display text-xl font-semibold">Not eligible to vote</h2>
              </div>
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {eligibility.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <Button variant="outline" onClick={() => setStep(1)}>Edit details</Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-7 w-7 text-success" />
                <h2 className="font-display text-xl font-semibold">You are eligible — cast your vote</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Select one candidate. Your vote is recorded only in this simulation.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {CANDIDATES.map((c) => {
                  const selected = candidate === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => setCandidate(c.name)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        selected
                          ? "border-primary bg-primary/5 shadow-soft"
                          : "border-border/80 hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c.name}</span>
                        {selected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{c.party}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={castVote} disabled={submitting || !candidate} className="bg-hero">
                  <VoteIcon className="mr-2 h-4 w-4" /> Cast vote
                </Button>
              </div>
            </div>
          )}

          {step === 4 && done && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
              <h2 className="font-display text-2xl font-bold">Vote recorded!</h2>
              <p className="text-muted-foreground">
                Your simulated vote for <span className="font-semibold text-foreground">{done.candidate}</span> has been
                saved. Reference: <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{done.id.slice(0, 8)}</code>
              </p>
              <Button onClick={reset} className="bg-hero">Run another simulation</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Simulate;

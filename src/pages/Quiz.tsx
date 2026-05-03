import { useEffect, useState } from "react";
import { Brain, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface Question {
  id: string;
  question: string;
  options: string[];
  category: string;
  difficulty: string;
}

interface ResultBreakdownItem {
  questionId: string;
  question: string;
  selectedIndex: number;
  correctIndex: number;
  correct: boolean;
  explanation?: string;
}

interface QuizResult {
  id: string;
  score: number;
  total: number;
  percentage: number;
  breakdown: ResultBreakdownItem[];
}

const Quiz = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setResult(null);
    setAnswers({});
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, question, options, category, difficulty")
      .limit(8);
    if (error) {
      toast.error("Could not load quiz");
    } else {
      setQuestions(
        (data ?? []).map((q) => ({
          ...q,
          options: q.options as unknown as string[],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Answer all questions first");
      return;
    }
    setSubmitting(true);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id],
      }));
      const { data, error } = await supabase.functions.invoke("quiz-submit", {
        body: { answers: payload },
      });
      if (error) throw error;
      setResult(data);
      trackEvent("quiz_submit", { score: data?.score ?? 0, total: questions.length });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      toast.error("Could not submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-3xl py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold">Election Quiz</h1>
            <p className="text-muted-foreground">8 questions · instant scoring · explanations included</p>
          </div>
          {result && (
            <Button variant="outline" onClick={load}>
              <RotateCcw className="mr-2 h-4 w-4" /> Retake
            </Button>
          )}
        </div>

        {loading && <p className="text-muted-foreground">Loading questions…</p>}

        {result && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-border/80 bg-card-soft shadow-elegant">
            <div className="bg-hero px-6 py-8 text-center text-primary-foreground">
              <Brain className="mx-auto mb-2 h-10 w-10" />
              <p className="text-sm uppercase tracking-widest opacity-90">Your score</p>
              <p className="font-display text-5xl font-bold">
                {result.score}<span className="text-2xl opacity-80">/{result.total}</span>
              </p>
              <p className="mt-1 text-lg opacity-90">{result.percentage}%</p>
            </div>
            <div className="space-y-3 p-6">
              {result.breakdown.map((b, i) => (
                <div
                  key={b.questionId}
                  className="rounded-xl border border-border/80 bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    {b.correct ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    ) : (
                      <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">
                        {i + 1}. {b.question}
                      </p>
                      {b.explanation && (
                        <p className="mt-1 text-sm text-muted-foreground">{b.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="space-y-5">
            {questions.map((q, qi) => (
              <div key={q.id} className="rounded-2xl border border-border/80 bg-card-soft p-5 shadow-soft">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5">{q.category}</span>
                  <span className="rounded bg-secondary px-2 py-0.5">{q.difficulty}</span>
                </div>
                <p className="mb-4 font-medium">
                  {qi + 1}. {q.question}
                </p>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                        className={`rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                          selected
                            ? "border-primary bg-primary/5 font-medium"
                            : "border-border/80 hover:border-primary/50 hover:bg-secondary/40"
                        }`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button
              onClick={submit}
              disabled={submitting || Object.keys(answers).length !== questions.length}
              size="lg"
              className="w-full bg-hero"
            >
              {submitting ? "Submitting…" : "Submit answers"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Quiz;

// Edge function: quiz-submit
// Grades quiz answers server-side (so correct answers never leak to the client)
// and stores the result.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { answers } = await req.json();
    if (!Array.isArray(answers) || answers.length === 0 || answers.length > 50) {
      return new Response(JSON.stringify({ error: "answers: 1-50 items required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ids = answers.map((a: any) => a.questionId);
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: questions, error: qErr } = await supabase
      .from("quiz_questions")
      .select("id, correct_index, explanation, options, question")
      .in("id", ids);

    if (qErr) throw qErr;

    const qMap = new Map(questions!.map((q) => [q.id, q]));
    let score = 0;
    const breakdown = answers.map((a: any) => {
      const q = qMap.get(a.questionId);
      if (!q) throw new Error(`Unknown questionId: ${a.questionId}`);
      const correct = Number(a.selectedIndex) === q.correct_index;
      if (correct) score += 1;
      return {
        questionId: q.id,
        question: q.question,
        selectedIndex: Number(a.selectedIndex),
        correctIndex: q.correct_index,
        correct,
        explanation: q.explanation,
      };
    });

    const total = answers.length;
    const percentage = Math.round((score / total) * 100);

    const { data: result, error: rErr } = await supabase
      .from("quiz_results")
      .insert({ score, total, percentage, breakdown })
      .select()
      .single();
    if (rErr) throw rErr;

    return new Response(
      JSON.stringify({ id: result.id, score, total, percentage, breakdown }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("quiz-submit error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

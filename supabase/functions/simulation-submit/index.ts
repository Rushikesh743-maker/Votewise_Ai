// Edge function: simulation-submit
// Runs mock eligibility logic and saves a vote simulation.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function checkEligibility(v: {
  age: number;
  isCitizen: boolean;
  voterId: string;
  constituency: string;
}) {
  const reasons: string[] = [];
  if (typeof v.age !== "number" || v.age < 18) reasons.push("Voter must be at least 18 years old.");
  if (!v.isCitizen) reasons.push("Voter must be a citizen.");
  if (!v.voterId || v.voterId.trim().length < 4) reasons.push("A valid Voter ID is required.");
  if (!v.constituency || v.constituency.trim().length < 2) reasons.push("Constituency is required.");
  return { eligible: reasons.length === 0, reasons };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { voter, candidate, party, mode } = body;

    if (!voter || typeof voter !== "object") {
      return new Response(JSON.stringify({ error: "voter is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { eligible, reasons } = checkEligibility(voter);

    // mode: "check" only returns eligibility without saving
    if (mode === "check") {
      return new Response(JSON.stringify({ eligible, reasons }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!eligible) {
      return new Response(JSON.stringify({ error: "Voter is not eligible", reasons }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!candidate || typeof candidate !== "string" || !candidate.trim()) {
      return new Response(JSON.stringify({ error: "candidate is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("simulations")
      .insert({
        voter,
        eligible,
        eligibility_reasons: reasons,
        candidate: candidate.trim(),
        party: party?.trim() ?? null,
      })
      .select()
      .single();
    if (error) throw error;

    return new Response(
      JSON.stringify({ id: data.id, eligible, candidate: data.candidate, party: data.party }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("simulation-submit error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Edge function: chat-message
// Maps user messages to structured predefined election-related responses
// and persists chat history per session.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const KB: { keywords: string[]; response: string }[] = [
  {
    keywords: ["register", "registration", "enroll", "sign up to vote"],
    response:
      "To register as a voter, fill out Form 6 on the Election Commission portal (or your country's equivalent), upload an ID + address proof, and submit. You'll get a Voter ID once verified.",
  },
  {
    keywords: ["eligible", "eligibility", "who can vote", "age to vote"],
    response:
      "You are typically eligible to vote if you are: (1) a citizen, (2) at least 18 years old on the qualifying date, and (3) registered in the electoral roll of your constituency.",
  },
  {
    keywords: ["evm", "electronic voting", "voting machine"],
    response:
      "An EVM (Electronic Voting Machine) records votes electronically. It has a Control Unit (with the polling officer) and a Ballot Unit (in the booth). VVPAT slips provide a paper audit trail.",
  },
  {
    keywords: ["vvpat", "paper trail"],
    response:
      "VVPAT (Voter Verifiable Paper Audit Trail) prints a slip showing your candidate and party, visible for ~7 seconds, then dropped into a sealed box for audits.",
  },
  {
    keywords: ["polling booth", "where to vote", "polling station"],
    response:
      "Your polling booth is assigned based on your registered address. Check your Voter ID, the official voter portal, or SMS services to find the exact location and booth number.",
  },
  {
    keywords: ["nota"],
    response:
      "NOTA (\"None Of The Above\") lets you formally reject all candidates on the ballot. It is recorded but does not currently change the election outcome.",
  },
  {
    keywords: ["postal ballot", "absentee"],
    response:
      "Postal ballots are available to specific categories such as service voters, election-duty staff, senior citizens above a threshold age, and persons with disabilities, on application.",
  },
  {
    keywords: ["model code of conduct", "mcc"],
    response:
      "The Model Code of Conduct is a set of guidelines from the Election Commission that comes into force once elections are announced, regulating campaigning, speeches, and government actions.",
  },
  {
    keywords: ["count", "counting", "result day"],
    response:
      "On counting day, EVM votes are tallied at designated counting centres under observers. VVPAT slips from randomly selected booths are matched with EVM totals before final results.",
  },
  {
    keywords: ["voter id", "epic"],
    response:
      "A Voter ID (EPIC) is the photo identity card issued to a registered voter. Alternative IDs (passport, Aadhaar, driving licence, etc.) are also accepted as notified by the EC.",
  },
];

const FALLBACK =
  "I'm focused on election-related questions. Try asking about voter registration, eligibility, EVMs, VVPAT, NOTA, polling booths, postal ballots, or counting day.";

function getReply(message: string): string {
  const text = message.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some((k) => text.includes(k))) return entry.response;
  }
  return FALLBACK;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, sessionId: incomingSessionId } = await req.json();

    if (!message || typeof message !== "string" || !message.trim() || message.length > 2000) {
      return new Response(JSON.stringify({ error: "Message must be 1-2000 chars" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionId = incomingSessionId || crypto.randomUUID();
    const reply = getReply(message.trim());

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing } = await supabase
      .from("chat_sessions")
      .select("messages")
      .eq("session_id", sessionId)
      .maybeSingle();

    const newMessages = [
      ...((existing?.messages as any[]) ?? []),
      { role: "user", content: message.trim(), at: new Date().toISOString() },
      { role: "bot", content: reply, at: new Date().toISOString() },
    ];

    if (existing) {
      await supabase
        .from("chat_sessions")
        .update({ messages: newMessages, updated_at: new Date().toISOString() })
        .eq("session_id", sessionId);
    } else {
      await supabase.from("chat_sessions").insert({ session_id: sessionId, messages: newMessages });
    }

    return new Response(JSON.stringify({ sessionId, reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("chat-message error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

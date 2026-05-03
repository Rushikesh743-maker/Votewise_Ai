import { useEffect, useRef, useState } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";

interface Message {
  role: "user" | "bot";
  content: string;
}

const SUGGESTIONS = [
  "How do I register to vote?",
  "What is an EVM?",
  "Explain VVPAT",
  "What does NOTA mean?",
  "Who can vote?",
];

const messageSchema = z.string().trim().min(1, "Type a message").max(2000);

const Learn = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      content:
        "Hi! I'm the VoteWise assistant. Ask me anything about the election process — registration, EVMs, VVPAT, NOTA, polling booths and more.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (raw: string) => {
    const parsed = messageSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const message = parsed.data;
    setMessages((m) => [...m, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat-message", {
        body: { message, sessionId },
      });
      if (error) throw error;
      setSessionId(data.sessionId);
      setMessages((m) => [...m, { role: "bot", content: data.reply }]);
      trackEvent("chat_message_sent", { length: message.length });
    } catch (e) {
      console.error(e);
      toast.error("Could not reach the assistant. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="container flex flex-1 flex-col py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Election Learning Chat</h1>
          <p className="text-muted-foreground">
            A guided assistant trained on election-process essentials.
          </p>
        </div>

        <div className="flex flex-1 flex-col rounded-2xl border border-border/80 bg-card-soft shadow-soft">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6" style={{ minHeight: 360 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                    m.role === "user" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </span>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-secondary text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </span>
                <div className="rounded-2xl rounded-tl-sm bg-secondary px-4 py-3 text-sm text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border/80 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <Sparkles className="h-3 w-3" />
                  {s}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about voter registration, EVMs, VVPAT…"
                maxLength={2000}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()} className="bg-hero">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Learn;

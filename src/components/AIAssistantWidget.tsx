import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { AutoTextarea } from "./AutoTextarea";
import { useAuth } from "@/contexts/AuthContext";

interface Msg { role: "user" | "assistant"; content: string }

export function AIAssistantWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm the EasyEstate AI assistant. Ask me about properties, EMI, or how to navigate the site." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: next },
      });
      if (error) throw error;
      setMessages([...next, { role: "assistant", content: data?.reply ?? "Sorry, I couldn't respond." }]);
      if (user) {
        await supabase.from("ai_chat_messages").insert([
          { user_id: user.id, role: "user", content: text },
          { user_id: user.id, role: "assistant", content: data?.reply ?? "" },
        ]);
      }
    } catch (e: any) {
      setMessages([...next, { role: "assistant", content: "I'm having trouble right now. Please try again shortly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-40 rounded-full h-14 px-5 gap-2 bg-brand hover:bg-brand/90 text-brand-foreground shadow-xl"
        >
          <Sparkles className="h-5 w-5" /> Ask AI
        </Button>
      )}
      {open && (
        <div className="fixed bottom-5 right-5 z-40 w-[min(380px,calc(100vw-2rem))] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b bg-brand text-brand-foreground">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4" /> EasyEstate AI
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-80"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground">AI is thinking…</div>}
          </div>
          <div className="p-2 border-t flex gap-2 items-end">
            <AutoTextarea
              value={input}
              onChange={setInput}
              onEnter={send}
              placeholder="Ask anything about properties…"
            />
            <Button size="icon" onClick={send} disabled={loading || !input.trim()} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

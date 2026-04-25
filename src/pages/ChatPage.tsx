import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AutoTextarea } from "@/components/AutoTextarea";
import { Send } from "lucide-react";

interface Conv { id: string; property_id: string | null; user_id: string; owner_id: string; properties?: { title: string } | null }
interface Msg { id: string; conversation_id: string; sender_id: string; content: string; created_at: string }

export default function ChatPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [active, setActive] = useState<string | null>(params.get("c"));
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("conversations")
      .select("id,property_id,user_id,owner_id,properties(title)")
      .or(`user_id.eq.${user.id},owner_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setConvs((data ?? []) as any);
        if (!active && data?.[0]) setActive(data[0].id);
      });
  }, [user]);

  useEffect(() => {
    if (!active) return;
    setParams({ c: active });
    supabase.from("messages").select("*").eq("conversation_id", active).order("created_at", { ascending: true })
      .then(({ data }) => setMessages((data ?? []) as Msg[]));
    const ch = supabase.channel(`m-${active}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${active}` },
        (payload) => setMessages((prev) => [...prev, payload.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [active]);

  useEffect(() => { scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || !active || !user) return;
    const text = input.trim();
    setInput("");
    await supabase.from("messages").insert({ conversation_id: active, sender_id: user.id, content: text });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      <h1 className="font-display text-3xl font-bold mb-4">Messages</h1>
      <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
        <Card className="col-span-12 md:col-span-4 overflow-y-auto">
          {convs.length === 0 && <p className="p-4 text-sm text-muted-foreground">No conversations yet. Open a property and click "Chat with owner".</p>}
          {convs.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)} className={`w-full text-left p-3 border-b hover:bg-muted/50 ${active === c.id ? "bg-muted" : ""}`}>
              <p className="font-medium text-sm">{c.properties?.title ?? "Conversation"}</p>
              <p className="text-xs text-muted-foreground">{c.user_id === user?.id ? "You ↔ Owner" : "You ↔ Buyer"}</p>
            </button>
          ))}
        </Card>
        <Card className="col-span-12 md:col-span-8 flex flex-col min-h-0">
          <div ref={scroller} className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${m.sender_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{m.content}</div>
              </div>
            ))}
            {active && messages.length === 0 && <p className="text-center text-sm text-muted-foreground">No messages yet — say hi!</p>}
          </div>
          <div className="p-3 border-t flex gap-2 items-end">
            <AutoTextarea value={input} onChange={setInput} onEnter={send} placeholder="Type a message…" />
            <Button onClick={send} disabled={!input.trim() || !active} className="bg-primary hover:bg-primary/90"><Send className="h-4 w-4" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

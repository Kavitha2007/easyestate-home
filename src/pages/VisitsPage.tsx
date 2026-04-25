import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function VisitsPage({ owner = false }: { owner?: boolean }) {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    if (!user) return;
    const col = owner ? "owner_id" : "user_id";
    const { data } = await supabase
      .from("visit_requests")
      .select("*, properties(title, city)")
      .eq(col, user.id).order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, [user, owner]);

  const setStatus = async (id: string, status: string) => {
    await supabase.from("visit_requests").update({ status }).eq("id", id);
    toast.success(`Visit ${status}`);
    load();
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-4">
      <h1 className="font-display text-4xl font-bold">{owner ? "Visit Requests (Owner)" : "My Visit Requests"}</h1>
      {items.length === 0 && <Card className="p-10 text-center text-muted-foreground">No visit requests yet.</Card>}
      {items.map((v) => (
        <Card key={v.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{v.properties?.title} · {v.properties?.city}</p>
            <p className="text-sm text-muted-foreground">{v.visit_date} at {v.visit_time}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={v.status === "accepted" ? "secondary" : v.status === "rejected" ? "destructive" : "outline"} className="capitalize">{v.status}</Badge>
            {owner && v.status === "pending" && (
              <>
                <Button size="sm" onClick={() => setStatus(v.id, "accepted")} className="bg-primary hover:bg-primary/90">Accept</Button>
                <Button size="sm" variant="destructive" onClick={() => setStatus(v.id, "rejected")}>Reject</Button>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, CheckCircle2, BarChart3, MessageCircle, Plus, Database } from "lucide-react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [props, setProps] = useState<any[]>([]);
  const [stats, setStats] = useState({ listings: 0, approved: 0, views: 0, inquiries: 0 });
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("properties").select("*").eq("owner_id", user.id).order("created_at", { ascending: false });
    setProps(data ?? []);
    const approved = (data ?? []).filter((p) => p.status === "approved").length;
    const views = (data ?? []).reduce((s, p) => s + (p.views ?? 0), 0);
    const { count: inq } = await supabase.from("conversations").select("id", { count: "exact", head: true }).eq("owner_id", user.id);
    setStats({ listings: data?.length ?? 0, approved, views, inquiries: inq ?? 0 });
  };

  useEffect(() => { load(); }, [user]);

  const seed = async () => {
    setSeeding(true);
    try {
      const { error } = await supabase.functions.invoke("seed-properties");
      if (error) throw error;
      toast.success("Demo properties added");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally { setSeeding(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-brand flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> RELIABLE ESTATE</p>
        <h1 className="font-display text-5xl font-bold mt-2">Owner Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage listings, view analytics, respond to bookings and chats.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"><Link to="/owner/add"><Plus className="h-4 w-4" /> Add new property</Link></Button>
        <Button onClick={seed} disabled={seeding} className="bg-primary hover:bg-primary/90 gap-2"><Database className="h-4 w-4" /> {seeding ? "Seeding..." : "Seed demo data (6 properties)"}</Button>
        <Button asChild variant="outline" className="gap-2"><Link to="/chat"><MessageCircle className="h-4 w-4" /> My chats</Link></Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5"><Building2 className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.listings}</div><div className="text-sm text-muted-foreground">Listings</div></Card>
        <Card className="p-5"><CheckCircle2 className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.approved}</div><div className="text-sm text-muted-foreground">Approved</div></Card>
        <Card className="p-5"><BarChart3 className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.views}</div><div className="text-sm text-muted-foreground">Total views</div></Card>
        <Card className="p-5"><MessageCircle className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.inquiries}</div><div className="text-sm text-muted-foreground">Inquiries</div></Card>
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold mb-3">My listings</h2>
        <Card className="overflow-hidden">
          <div className="bg-accent/30 px-4 py-2 grid grid-cols-12 text-xs font-semibold uppercase text-foreground">
            <div className="col-span-5">Title</div><div className="col-span-2">City</div><div className="col-span-2">Price</div><div className="col-span-2">Status</div><div className="col-span-1">Views</div>
          </div>
          {props.map((p) => (
            <div key={p.id} className="px-4 py-3 grid grid-cols-12 text-sm border-t hover:bg-muted/40">
              <div className="col-span-5 font-medium">{p.title}</div>
              <div className="col-span-2 text-muted-foreground">{p.city}</div>
              <div className="col-span-2">{formatINR(Number(p.price))}</div>
              <div className="col-span-2"><Badge variant={p.status === "approved" ? "secondary" : "outline"} className="capitalize">{p.status}</Badge></div>
              <div className="col-span-1 text-muted-foreground">{p.views}</div>
            </div>
          ))}
          {props.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No listings yet. Add one or seed demo data.</div>}
        </Card>
      </div>
    </div>
  );
}

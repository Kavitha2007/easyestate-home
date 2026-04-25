import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Heart, Calendar, MessageCircle, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/PropertyCard";
import { toast } from "sonner";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ favs: 0, bookings: 0, chats: 0, saved: 0 });
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [prefs, setPrefs] = useState({ preferred_city: "", budget_min: "", budget_max: "" });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: favs }, { count: bookings }, { count: chats }] = await Promise.all([
        supabase.from("favorites").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("conversations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setCounts({ favs: favs ?? 0, bookings: bookings ?? 0, chats: chats ?? 0, saved: 0 });

      const { data: prof } = await supabase.from("profiles").select("preferred_city,budget_min,budget_max").eq("id", user.id).single();
      if (prof) setPrefs({
        preferred_city: prof.preferred_city ?? "",
        budget_min: prof.budget_min?.toString() ?? "",
        budget_max: prof.budget_max?.toString() ?? "",
      });

      let q = supabase.from("properties")
        .select("id,title,city,price,bedrooms,bathrooms,area_sqft,property_type,listing_type,cover_image")
        .eq("status", "approved").limit(6);
      if (prof?.preferred_city) q = q.ilike("city", `%${prof.preferred_city}%`);
      if (prof?.budget_max) q = q.lte("price", Number(prof.budget_max));
      const { data } = await q;
      setRecommended((data ?? []) as Property[]);
    })();
  }, [user]);

  const savePrefs = async () => {
    if (!user) return;
    await supabase.from("profiles").update({
      preferred_city: prefs.preferred_city || null,
      budget_min: prefs.budget_min ? Number(prefs.budget_min) : null,
      budget_max: prefs.budget_max ? Number(prefs.budget_max) : null,
    }).eq("id", user.id);
    toast.success("Preferences saved");
  };

  const stats = [
    { v: counts.favs, l: "Favorites", icon: Heart },
    { v: counts.bookings, l: "Bookings", icon: Calendar },
    { v: counts.chats, l: "Chats", icon: MessageCircle },
    { v: counts.saved, l: "Saved searches", icon: Search },
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-brand flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> RELIABLE ESTATE</p>
        <h1 className="font-display text-5xl font-bold mt-2">User Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your favorites, bookings, conversations and recommendations.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="p-5">
            <s.icon className="h-5 w-5 text-primary" />
            <div className="font-display text-3xl font-bold mt-3">{s.v}</div>
            <div className="text-sm text-muted-foreground">{s.l}</div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button asChild className="bg-primary hover:bg-primary/90 gap-2 h-12"><Link to="/search"><Search className="h-4 w-4" /> Search properties</Link></Button>
        <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 h-12"><Link to="/favorites"><Heart className="h-4 w-4" /> View favorites</Link></Button>
        <Button asChild variant="outline" className="gap-2 h-12"><Link to="/chat"><MessageCircle className="h-4 w-4" /> My conversations</Link></Button>
      </div>
      <Card className="p-5">
        <h3 className="font-display text-xl font-bold">Your preferences</h3>
        <p className="text-xs text-muted-foreground mb-3">Used to power "Recommended Properties Near You".</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div><Label>Preferred city / area</Label><Input value={prefs.preferred_city} onChange={(e) => setPrefs({ ...prefs, preferred_city: e.target.value })} /></div>
          <div><Label>Budget min ₹</Label><Input type="number" value={prefs.budget_min} onChange={(e) => setPrefs({ ...prefs, budget_min: e.target.value })} /></div>
          <div><Label>Budget max ₹</Label><Input type="number" value={prefs.budget_max} onChange={(e) => setPrefs({ ...prefs, budget_max: e.target.value })} /></div>
        </div>
        <Button onClick={savePrefs} className="mt-3 bg-primary hover:bg-primary/90">Save preferences</Button>
      </Card>
      <div>
        <h2 className="font-display text-2xl font-bold">Recommended Properties Near You</h2>
        <p className="text-sm text-muted-foreground mb-4">Based on your preferred location (set one below) and budget.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommended.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
        {recommended.length === 0 && <Card className="p-10 text-center text-muted-foreground">No matches yet — try widening your budget.</Card>}
      </div>
    </div>
  );
}

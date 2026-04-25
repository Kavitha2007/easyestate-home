import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin, Heart, MessageCircle, ExternalLink, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatINR, calcEMI } from "@/lib/format";
import { toast } from "sonner";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [p, setP] = useState<any>(null);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("10:00");
  const [emiYears, setEmiYears] = useState(20);
  const [emiRate, setEmiRate] = useState(8.5);

  useEffect(() => {
    if (!id) return;
    supabase.from("properties").select("*").eq("id", id).single().then(({ data }) => setP(data));
  }, [id]);

  if (!p) return <div className="p-10 text-muted-foreground">Loading…</div>;

  const fav = async () => {
    if (!user) return navigate("/auth");
    await supabase.from("favorites").insert({ user_id: user.id, property_id: p.id });
    toast.success("Saved to favorites");
  };

  const startChat = async () => {
    if (!user) return navigate("/auth");
    const { data: existing } = await supabase
      .from("conversations").select("id")
      .eq("property_id", p.id).eq("user_id", user.id).eq("owner_id", p.owner_id).maybeSingle();
    if (existing) return navigate(`/chat?c=${existing.id}`);
    const { data } = await supabase.from("conversations").insert({
      property_id: p.id, user_id: user.id, owner_id: p.owner_id,
    }).select("id").single();
    if (data) navigate(`/chat?c=${data.id}`);
  };

  const scheduleVisit = async () => {
    if (!user) return navigate("/auth");
    if (!visitDate) return toast.error("Pick a date");
    const { error } = await supabase.from("visit_requests").insert({
      property_id: p.id, user_id: user.id, owner_id: p.owner_id,
      visit_date: visitDate, visit_time: visitTime,
    });
    if (error) toast.error(error.message); else toast.success("Visit request sent to owner");
  };

  const emi = calcEMI(p.price, emiRate, emiYears);
  const mapsUrl = p.latitude && p.longitude ? `https://www.google.com/maps?q=${p.latitude},${p.longitude}` : `https://www.google.com/maps?q=${encodeURIComponent(p.address || p.city)}`;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="aspect-[16/9] rounded-xl overflow-hidden bg-muted">
        <img src={p.cover_image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80"} alt={p.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className="uppercase bg-brand text-brand-foreground">{p.listing_type}</Badge>
        <Badge variant="secondary" className="capitalize">{p.property_type}</Badge>
        <Badge variant="outline" className="capitalize">{p.status}</Badge>
      </div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">{p.title}</h1>
          <p className="text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-4 w-4" /> {p.address || p.city}</p>
        </div>
        <div className="text-3xl font-display font-bold text-primary">{formatINR(Number(p.price))}</div>
      </div>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{p.bedrooms} bed</span>
        <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{p.bathrooms} bath</span>
        <span className="flex items-center gap-1"><Square className="h-4 w-4" />{p.area_sqft} ft²</span>
      </div>
      <p className="text-foreground/90 leading-relaxed">{p.description}</p>

      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-display text-xl font-bold mb-3">Location</h3>
          {p.latitude && p.longitude ? (
            <iframe
              title="map"
              className="w-full h-64 rounded-lg border"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${p.longitude-0.01},${p.latitude-0.01},${p.longitude+0.01},${p.latitude+0.01}&marker=${p.latitude},${p.longitude}`}
            />
          ) : <p className="text-muted-foreground text-sm">No coordinates pinned for this property.</p>}
          <Button asChild variant="outline" className="mt-3 gap-2">
            <a href={mapsUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View on Google Maps</a>
          </Button>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold">Property Insights</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Rain risk: <span className="text-foreground">Low</span></li>
            <li>• School within 2 km</li>
            <li>• Hospital within 3 km</li>
            <li>• Public transport nearby</li>
          </ul>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <p className="text-xs font-semibold text-primary">Merits</p>
              <p className="text-sm text-muted-foreground">Good connectivity, safe area</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-destructive">Demerits</p>
              <p className="text-sm text-muted-foreground">Moderate peak-hour traffic</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold flex items-center gap-2"><Calendar className="h-5 w-5" /> Schedule a visit</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date</Label><Input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} /></div>
            <div><Label>Time</Label><Input type="time" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} /></div>
          </div>
          <Button onClick={scheduleVisit} className="w-full bg-primary hover:bg-primary/90">Request visit</Button>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold">EMI Calculator</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Years</Label><Input type="number" value={emiYears} onChange={(e) => setEmiYears(Number(e.target.value))} /></div>
            <div><Label>Rate %</Label><Input type="number" step="0.1" value={emiRate} onChange={(e) => setEmiRate(Number(e.target.value))} /></div>
          </div>
          <p className="text-sm">Estimated monthly EMI: <span className="font-bold text-primary">{formatINR(Math.round(emi))}</span></p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={startChat} className="gap-2 bg-brand hover:bg-brand/90 text-brand-foreground">
          <MessageCircle className="h-4 w-4" /> Chat with owner
        </Button>
        <Button onClick={fav} variant="outline" className="gap-2"><Heart className="h-4 w-4" /> Save</Button>
      </div>
    </div>
  );
}

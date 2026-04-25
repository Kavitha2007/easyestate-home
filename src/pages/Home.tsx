import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/PropertyCard";
import hero from "@/assets/hero.jpg";

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [featured, setFeatured] = useState<Property[]>([]);
  const [stats, setStats] = useState({ count: 0 });

  useEffect(() => {
    supabase
      .from("properties")
      .select("id,title,city,price,bedrooms,bathrooms,area_sqft,property_type,listing_type,cover_image")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data, count }) => {
        setFeatured((data ?? []) as Property[]);
        setStats({ count: count ?? data?.length ?? 0 });
      });
  }, []);

  const handleSearch = () => {
    navigate(`/search${city ? `?city=${encodeURIComponent(city)}` : ""}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[520px] overflow-hidden">
          <img src={hero} alt="EasyEstate properties" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent" />
          <div className="relative h-full flex flex-col justify-center px-6 md:px-12 max-w-5xl">
            <Badge className="w-fit mb-5 bg-card/20 backdrop-blur text-primary-foreground border border-primary-foreground/30 gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> EasyEstate · Verified · Secure · Real-time
            </Badge>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Find a home you can <span className="text-accent">trust.</span>
            </h1>
            <p className="text-primary-foreground/90 mt-5 max-w-2xl text-base md:text-lg">
              EasyEstate — Trusted property buying, selling and renting platform with verified listings, location pinning and real-time chat.
            </p>
            <div className="mt-8 flex gap-2 max-w-2xl bg-card rounded-full p-1.5 shadow-xl">
              <div className="flex items-center pl-4 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by city, e.g. Bangalore, Chennai"
                className="border-0 focus-visible:ring-0 bg-transparent"
              />
              <Button onClick={handleSearch} className="rounded-full px-8 bg-primary hover:bg-primary/90">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-7xl mx-auto">
        {[
          { v: `${stats.count}+`, l: "Verified properties" },
          { v: "5", l: "Cities covered" },
          { v: "1", l: "Click chat with owner" },
          { v: "24/7", l: "AI assistant" },
        ].map((s, i) => (
          <Card key={i} className="p-6">
            <div className="font-display text-3xl font-bold">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </Card>
        ))}
      </section>

      {/* Featured */}
      <section className="px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold">Featured properties</h2>
            <p className="text-muted-foreground">Recently added, fully verified listings.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/properties")}>View all</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
        {featured.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">
            No properties yet. Owners can sign in and seed demo data from the Owner Dashboard.
          </Card>
        )}
      </section>
    </div>
  );
}

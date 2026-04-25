import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/PropertyCard";
import { Card } from "@/components/ui/card";

export default function AllProperties() {
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => {
    supabase.from("properties")
      .select("id,title,city,price,bedrooms,bathrooms,area_sqft,property_type,listing_type,cover_image")
      .eq("status", "approved").order("created_at", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as Property[]));
  }, []);
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-bold mb-6">All Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
      {items.length === 0 && <Card className="p-10 text-center text-muted-foreground">No properties yet.</Card>}
    </div>
  );
}

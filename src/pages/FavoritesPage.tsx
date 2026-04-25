import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/PropertyCard";

export default function FavoritesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Property[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("favorites").select("properties(id,title,city,price,bedrooms,bathrooms,area_sqft,property_type,listing_type,cover_image)")
      .eq("user_id", user.id)
      .then(({ data }) => setItems((data ?? []).map((d: any) => d.properties).filter(Boolean) as Property[]));
  }, [user]);
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-bold mb-6">Saved Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
      {items.length === 0 && <Card className="p-10 text-center text-muted-foreground">No saved properties yet.</Card>}
    </div>
  );
}

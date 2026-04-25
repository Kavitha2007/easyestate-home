import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard, type Property } from "@/components/PropertyCard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [params] = useSearchParams();
  const [results, setResults] = useState<Property[]>([]);
  const [filters, setFilters] = useState({
    city: params.get("city") ?? "",
    minPrice: "",
    maxPrice: "",
    type: "",
    listing: "",
    bedrooms: "",
  });
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    let q = supabase
      .from("properties")
      .select("id,title,city,price,bedrooms,bathrooms,area_sqft,property_type,listing_type,cover_image")
      .eq("status", "approved");
    if (filters.city) q = q.ilike("city", `%${filters.city}%`);
    if (filters.minPrice) q = q.gte("price", Number(filters.minPrice));
    if (filters.maxPrice) q = q.lte("price", Number(filters.maxPrice));
    if (filters.type) q = q.eq("property_type", filters.type);
    if (filters.listing) q = q.eq("listing_type", filters.listing);
    if (filters.bedrooms) q = q.gte("bedrooms", Number(filters.bedrooms));
    const { data } = await q.order("created_at", { ascending: false });
    setResults((data ?? []) as Property[]);
    setLoading(false);
  };

  useEffect(() => { run(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl font-bold mb-6">Search Properties</h1>
      <Card className="p-5 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="col-span-2"><Label>City</Label><Input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} placeholder="Any city" /></div>
          <div><Label>Min ₹</Label><Input type="number" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} /></div>
          <div><Label>Max ₹</Label><Input type="number" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} /></div>
          <div>
            <Label>Type</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Any</option><option value="apartment">Apartment</option><option value="house">House</option><option value="land">Land</option>
            </select>
          </div>
          <div>
            <Label>Listing</Label>
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={filters.listing} onChange={(e) => setFilters({ ...filters, listing: e.target.value })}>
              <option value="">Any</option><option value="buy">Buy</option><option value="rent">Rent</option><option value="lease">Lease</option>
            </select>
          </div>
          <div className="col-span-2 md:col-span-1"><Label>Min beds</Label><Input type="number" value={filters.bedrooms} onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })} /></div>
          <Button onClick={run} className="md:col-span-1 mt-auto bg-primary hover:bg-primary/90 gap-2"><Search className="h-4 w-4" /> Search</Button>
        </div>
      </Card>
      {loading ? <p className="text-muted-foreground">Searching…</p> : (
        <>
          <p className="text-sm text-muted-foreground mb-4">{results.length} result{results.length !== 1 && "s"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {results.map((p) => <PropertyCard key={p.id} p={p} />)}
          </div>
          {results.length === 0 && <Card className="p-10 text-center text-muted-foreground">No matching properties.</Card>}
        </>
      )}
    </div>
  );
}

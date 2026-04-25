import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Square, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { formatINR } from "@/lib/format";

export interface Property {
  id: string;
  title: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  property_type: string;
  listing_type: string;
  cover_image: string | null;
}

const FALLBACK = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Card className="overflow-hidden flex flex-col bg-card border-border/60 hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={p.cover_image || FALLBACK}
          alt={p.title}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => ((e.target as HTMLImageElement).src = FALLBACK)}
        />
        <Badge className="absolute top-3 left-3 bg-brand text-brand-foreground uppercase">{p.listing_type}</Badge>
        <Badge variant="secondary" className="absolute top-3 right-3 bg-card/90 capitalize">{p.property_type}</Badge>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display text-lg font-bold leading-tight">{p.title}</h3>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" /> {p.city}
        </p>
        <p className="text-xl font-semibold text-primary">{formatINR(p.price)}</p>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{p.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms}</span>
          <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" />{p.area_sqft} ft²</span>
        </div>
        <Button asChild className="mt-auto w-full bg-primary hover:bg-primary/90">
          <Link to={`/properties/${p.id}`}>View details</Link>
        </Button>
      </div>
    </Card>
  );
}

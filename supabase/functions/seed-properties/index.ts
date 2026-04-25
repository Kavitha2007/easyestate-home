import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SAMPLE = [
  { title: "Modern 2BHK Apartment", city: "Chennai", price: 5000000, property_type: "apartment", listing_type: "buy", bedrooms: 2, bathrooms: 2, area_sqft: 1000, latitude: 13.0827, longitude: 80.2707, address: "T. Nagar, Chennai", description: "Bright 2BHK with balcony in central Chennai.", amenities: ["Lift","Parking","Power backup"], cover_image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80" },
  { title: "Luxury Villa in Whitefield", city: "Bangalore", price: 12000000, property_type: "house", listing_type: "buy", bedrooms: 4, bathrooms: 5, area_sqft: 4200, latitude: 12.9698, longitude: 77.7500, address: "Whitefield, Bangalore", description: "Spacious villa with private pool and garden.", amenities: ["Pool","Garden","Gym","Smart home"], cover_image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&q=80" },
  { title: "Budget Family House in Anna Nagar", city: "Madurai", price: 3500000, property_type: "house", listing_type: "buy", bedrooms: 3, bathrooms: 2, area_sqft: 1600, latitude: 9.9252, longitude: 78.1198, address: "Anna Nagar, Madurai", description: "Cozy independent home, ideal for growing families.", amenities: ["Parking","Garden"], cover_image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80" },
  { title: "Beach House Retreat", city: "Goa", price: 9000000, property_type: "house", listing_type: "buy", bedrooms: 3, bathrooms: 3, area_sqft: 2400, latitude: 15.2993, longitude: 74.1240, address: "Anjuna, Goa", description: "Tropical beach retreat steps from the shore.", amenities: ["Beach access","Pool","Wifi"], cover_image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80" },
  { title: "City Studio Apartment in Bandra", city: "Mumbai", price: 4500000, property_type: "apartment", listing_type: "buy", bedrooms: 1, bathrooms: 1, area_sqft: 520, latitude: 19.0596, longitude: 72.8295, address: "Bandra West, Mumbai", description: "Compact studio in vibrant Bandra neighborhood.", amenities: ["Lift","Security","Wifi"], cover_image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80" },
  { title: "Modern Apartment in T. Nagar", city: "Chennai", price: 5000000, property_type: "apartment", listing_type: "buy", bedrooms: 2, bathrooms: 2, area_sqft: 1100, latitude: 13.0418, longitude: 80.2341, address: "T. Nagar, Chennai", description: "Premium apartment with city views.", amenities: ["Lift","Pool","Gym"], cover_image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const auth = req.headers.get("Authorization") ?? "";
    const token = auth.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);
    const owner_id = userData.user?.id;
    if (!owner_id) throw new Error("Not authenticated");

    const rows = SAMPLE.map((p) => ({ ...p, owner_id, status: "approved" }));
    const { error } = await supabase.from("properties").insert(rows);
    if (error) throw error;

    return new Response(JSON.stringify({ inserted: rows.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

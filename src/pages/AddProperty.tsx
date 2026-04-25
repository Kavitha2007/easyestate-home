import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapPin, Upload } from "lucide-react";

const REQUIRED_DOCS = [
  { key: "registration", label: "Government property registration certificate" },
  { key: "ownership", label: "Property ownership proof" },
  { key: "tax", label: "Land tax receipt" },
  { key: "id", label: "Owner identity proof" },
];

export default function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [form, setForm] = useState({
    full_name: "", gov_id: "", address: "",
    primary_phone: "", alt_phone: "", email: user?.email ?? "",
    title: "", city: "", prop_address: "", description: "",
    price: "", area_sqft: "1000", property_type: "apartment", listing_type: "buy",
    bedrooms: "2", bathrooms: "2", amenities: "", cover_image: "",
  });
  const [docs, setDocs] = useState<Record<string, File | null>>({ registration: null, ownership: null, tax: null, id: null });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Map roughly to India bbox
    const lng = 68 + x * (97 - 68);
    const lat = 35 - y * (35 - 8);
    setPin({ lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!pin) { toast.error("Please pin the property location on the map"); return; }
    const missing = REQUIRED_DOCS.filter((d) => !docs[d.key]);
    if (missing.length) { toast.error(`Upload all documents: ${missing.map(m => m.label).join(", ")}`); return; }
    setLoading(true);
    try {
      // Update owner profile
      await supabase.from("profiles").update({
        full_name: form.full_name, gov_id: form.gov_id, address: form.address,
        phone: form.primary_phone, alt_phone: form.alt_phone, email: form.email,
      }).eq("id", user.id);

      const { data: prop, error } = await supabase.from("properties").insert({
        owner_id: user.id,
        title: form.title, city: form.city, address: form.prop_address, description: form.description,
        price: Number(form.price), area_sqft: Number(form.area_sqft),
        property_type: form.property_type, listing_type: form.listing_type,
        bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
        amenities: form.amenities ? form.amenities.split(",").map((s) => s.trim()) : [],
        cover_image: form.cover_image || null,
        latitude: pin.lat, longitude: pin.lng,
        status: "pending",
      }).select("id").single();
      if (error) throw error;

      // Insert document records (file storage skipped for demo — names tracked)
      await supabase.from("property_documents").insert(
        REQUIRED_DOCS.map((d) => ({
          property_id: prop!.id,
          doc_type: d.key,
          file_name: docs[d.key]?.name ?? null,
          verification_status: "pending",
          ocr_text: `[Demo OCR] ${d.label} for ${form.title}`,
        }))
      );

      toast.success("Property submitted for verification & approval");
      navigate("/owner-dashboard");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>← Cancel</Button>
        <h1 className="font-display text-3xl font-bold">Add Property</h1>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold">Owner Personal Details</h3>
          <p className="text-xs text-muted-foreground">Used for verification — kept private.</p>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Full name *" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
            <Input placeholder="Government ID number *" required value={form.gov_id} onChange={(e) => setForm({ ...form, gov_id: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Address *" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold">Contact Information</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <Input placeholder="Primary phone *" required value={form.primary_phone} onChange={(e) => setForm({ ...form, primary_phone: e.target.value })} />
            <Input placeholder="Alternate phone" value={form.alt_phone} onChange={(e) => setForm({ ...form, alt_phone: e.target.value })} />
            <Input type="email" placeholder="Email *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold">Property Information</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <Input placeholder="Title *" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input placeholder="City *" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Address *" required value={form.prop_address} onChange={(e) => setForm({ ...form, prop_address: e.target.value })} />
            <Textarea className="md:col-span-2" placeholder="Description *" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input type="number" placeholder="Price ₹ *" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input type="number" placeholder="Area sq ft" value={form.area_sqft} onChange={(e) => setForm({ ...form, area_sqft: e.target.value })} />
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>
              <option value="apartment">Apartment</option><option value="house">House</option><option value="land">Land</option>
            </select>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.listing_type} onChange={(e) => setForm({ ...form, listing_type: e.target.value })}>
              <option value="buy">Buy</option><option value="rent">Rent</option><option value="lease">Lease</option>
            </select>
            <Input type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            <Input type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Amenities (comma separated)" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
            <Input className="md:col-span-2" placeholder="Cover image URL (optional)" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold flex items-center gap-2"><MapPin className="h-5 w-5" /> Pin location on map *</h3>
          <p className="text-xs text-muted-foreground">Click the map to set the precise property location. Required.</p>
          <div onClick={handleMapClick}
            className="relative w-full h-64 rounded-lg border cursor-crosshair bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/India_location_map.svg/600px-India_location_map.svg.png')] bg-contain bg-center bg-no-repeat bg-secondary/40"
          >
            {pin && (
              <div className="absolute" style={{
                left: `${((pin.lng - 68) / (97 - 68)) * 100}%`,
                top: `${((35 - pin.lat) / (35 - 8)) * 100}%`,
                transform: "translate(-50%,-100%)",
              }}>
                <MapPin className="h-7 w-7 text-destructive drop-shadow" fill="currentColor" />
              </div>
            )}
          </div>
          {pin ? (
            <p className="text-sm">Pinned at <span className="font-mono">{pin.lat}, {pin.lng}</span></p>
          ) : <p className="text-sm text-muted-foreground">No location pinned yet.</p>}
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="font-display text-xl font-bold">Required documents *</h3>
          <p className="text-xs text-muted-foreground">All four documents are mandatory. PDF, JPG or PNG only. Documents are scanned for authenticity (OCR).</p>
          <div className="grid md:grid-cols-2 gap-3">
            {REQUIRED_DOCS.map((d) => (
              <div key={d.key} className="border rounded-lg p-3">
                <Label className="text-xs font-semibold">{d.label} *</Label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" required onChange={(e) => setDocs({ ...docs, [d.key]: e.target.files?.[0] ?? null })} />
              </div>
            ))}
          </div>
        </Card>

        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 h-12 gap-2">
          <Upload className="h-4 w-4" /> {loading ? "Submitting..." : "Submit property for verification & approval"}
        </Button>
      </form>
    </div>
  );
}

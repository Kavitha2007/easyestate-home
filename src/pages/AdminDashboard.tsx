import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Users, Building2, FileCheck2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatINR } from "@/lib/format";

export default function AdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, props: 0, pending: 0 });
  const [promoteEmail, setPromoteEmail] = useState("");
  const [promoting, setPromoting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [pendRes, pfRes, countRes] = await Promise.all([
        supabase.from("properties").select("*, property_documents(id, doc_type, verification_status)").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id,full_name,email,status"),
        supabase.from("properties").select("id", { count: "exact", head: true }),
      ]);
      setPending(pendRes.data ?? []);
      setUsers(pfRes.data ?? []);
      setStats({ users: pfRes.data?.length ?? 0, props: countRes.count ?? 0, pending: pendRes.data?.length ?? 0 });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("properties").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Property ${status}`);
    load();
  };
  const verifyDoc = async (id: string, status: string) => {
    const { error } = await supabase.from("property_documents").update({ verification_status: status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Document ${status}`);
    load();
  };

  const promote = async () => {
    const email = promoteEmail.trim();
    if (!email) return toast.error("Enter an email");
    setPromoting(true);
    const { data, error } = await supabase.functions.invoke("promote-admin", { body: { email } });
    setPromoting(false);
    if (error || (data as any)?.error) {
      toast.error((data as any)?.error || error?.message || "Failed to promote user");
      return;
    }
    toast.success("Admin role granted. The user must sign out and back in.");
    setPromoteEmail("");
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-xs font-semibold tracking-widest text-brand flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> ADMIN PANEL</p>
        <h1 className="font-display text-5xl font-bold mt-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Approve listings, verify documents, manage users.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5"><Users className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.users}</div><div className="text-sm text-muted-foreground">Users</div></Card>
        <Card className="p-5"><Building2 className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.props}</div><div className="text-sm text-muted-foreground">Total properties</div></Card>
        <Card className="p-5"><FileCheck2 className="h-5 w-5 text-primary" /><div className="font-display text-3xl font-bold mt-3">{stats.pending}</div><div className="text-sm text-muted-foreground">Pending approval</div></Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-xl font-bold mb-2">Approval guidelines</h2>
        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
          <li>Verify property ownership documents</li>
          <li>Confirm property location matches listing</li>
          <li>Ensure uploaded images match property description</li>
          <li>Check that property is not already listed</li>
        </ul>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-bold">Promote user to admin</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter the email of a registered user to grant administrator access. Only existing admins can perform this action.
        </p>
        <div className="space-y-2">
          <Label>User email</Label>
          <div className="flex gap-2">
            <Input value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)} placeholder="user@example.com" />
            <Button onClick={promote} disabled={promoting} className="bg-primary hover:bg-primary/90">
              {promoting ? "Working..." : "Grant admin"}
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="font-display text-2xl font-bold mb-3">Property Approvals</h2>
        {loading && <Card className="p-8 text-center text-muted-foreground">Loading...</Card>}
        {!loading && pending.length === 0 && <Card className="p-8 text-center text-muted-foreground">No pending properties.</Card>}
        {pending.map((p) => (
          <Card key={p.id} className="p-4 mb-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{p.title} <span className="text-muted-foreground font-normal">· {p.city} · {formatINR(Number(p.price))}</span></p>
                <p className="text-xs text-muted-foreground">{p.property_documents?.length ?? 0} documents uploaded</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setStatus(p.id, "approved")} className="bg-primary hover:bg-primary/90">Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setStatus(p.id, "rejected")}>Reject</Button>
              </div>
            </div>
            {p.property_documents?.length > 0 && (
              <div className="mt-3 grid md:grid-cols-2 gap-2">
                {p.property_documents.map((d: any) => (
                  <div key={d.id} className="border rounded p-2 flex items-center justify-between text-sm">
                    <span className="capitalize">{d.doc_type} <Badge variant="outline" className="ml-2 capitalize">{d.verification_status}</Badge></span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => verifyDoc(d.id, "verified")}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => verifyDoc(d.id, "suspicious")}>Flag</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div>
        <h2 className="font-display text-2xl font-bold mb-3">User Management</h2>
        <Card className="overflow-hidden">
          <div className="bg-accent/30 px-4 py-2 grid grid-cols-12 text-xs font-semibold uppercase">
            <div className="col-span-5">Name</div><div className="col-span-5">Email</div><div className="col-span-2">Status</div>
          </div>
          {users.map((u) => (
            <div key={u.id} className="px-4 py-2 grid grid-cols-12 text-sm border-t">
              <div className="col-span-5">{u.full_name ?? "—"}</div>
              <div className="col-span-5 text-muted-foreground">{u.email}</div>
              <div className="col-span-2"><Badge variant="secondary">{u.status}</Badge></div>
            </div>
          ))}
          {users.length === 0 && !loading && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No users yet.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

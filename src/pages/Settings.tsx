import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function Settings() {
  const { user, role } = useAuth();

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-5">
      <h1 className="font-display text-4xl font-bold">Settings</h1>

      <Card className="p-5 space-y-2">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> <span className="capitalize">{role}</span></p>
      </Card>

      <Card className="p-5 space-y-2 text-sm text-muted-foreground">
        <p>To change your role or request administrator access, please contact your account administrator.</p>
      </Card>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Home as HomeIcon } from "lucide-react";
import { toast } from "sonner";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordValid = (pw: string) => pw.length >= 8 && /[A-Za-z]/.test(pw) && /\d/.test(pw);

export default function Auth() {
  const { signIn, signUp, user, role } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get("mode") === "register" ? "register" : "login";
  const [tab, setTab] = useState(initialMode);
  const [loading, setLoading] = useState(false);

  const [li, setLi] = useState({ email: "", password: "" });
  const [reg, setReg] = useState({ email: "", password: "", fullName: "", role: "user" as "user" | "owner" });

  useEffect(() => {
    if (user && role) {
      const dest = role === "admin" ? "/admin-dashboard" : role === "owner" ? "/owner-dashboard" : "/dashboard";
      navigate(dest, { replace: true });
    }
  }, [user, role, navigate]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = li.email.trim();
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!li.password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, li.password);
    setLoading(false);
    if (error) {
      const msg = /invalid login credentials/i.test(error)
        ? "Incorrect email or password"
        : error;
      toast.error(msg);
    } else {
      toast.success("Welcome back!");
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = reg.email.trim();
    const fullName = reg.fullName.trim();
    if (!fullName) {
      toast.error("Please enter your full name");
      return;
    }
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!passwordValid(reg.password)) {
      toast.error("Password must be at least 8 characters and include letters and numbers");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, reg.password, fullName, reg.role);
    setLoading(false);
    if (error) toast.error(error);
    else toast.success("Account created. You're signed in.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md p-8">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="h-10 w-10 rounded-lg bg-brand text-brand-foreground flex items-center justify-center">
            <HomeIcon className="h-5 w-5" />
          </div>
          <span className="font-display text-2xl font-bold text-brand">EasyEstate</span>
        </Link>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Sign in</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" autoComplete="email" value={li.email} onChange={(e) => setLi({ ...li, email: e.target.value })} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" autoComplete="current-password" value={li.password} onChange={(e) => setLi({ ...li, password: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={onRegister} className="space-y-4">
              <div>
                <Label>Full name</Label>
                <Input value={reg.fullName} onChange={(e) => setReg({ ...reg, fullName: e.target.value })} required />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={reg.email} onChange={(e) => setReg({ ...reg, email: e.target.value })} required />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} required />
                <p className="text-[11px] text-muted-foreground mt-1">Minimum 8 characters with letters and numbers.</p>
              </div>
              <div>
                <Label>I am a</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button type="button" variant={reg.role === "user" ? "default" : "outline"} onClick={() => setReg({ ...reg, role: "user" })} className={reg.role === "user" ? "bg-primary" : ""}>
                    Buyer / Renter
                  </Button>
                  <Button type="button" variant={reg.role === "owner" ? "default" : "outline"} onClick={() => setReg({ ...reg, role: "owner" })} className={reg.role === "owner" ? "bg-primary" : ""}>
                    Owner / Seller
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}

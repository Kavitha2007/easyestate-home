import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "@/contexts/AuthContext";

export function Protected({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div className="p-10 text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (roles && role && !roles.includes(role)) {
    const dest = role === "admin" ? "/admin-dashboard" : role === "owner" ? "/owner-dashboard" : "/dashboard";
    return <Navigate to={dest} replace />;
  }
  return <>{children}</>;
}

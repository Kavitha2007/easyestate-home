import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home as HomeIcon, Search, Building2, LayoutDashboard, Heart, CalendarCheck, MessageCircle, Sparkles, Plus, Users, ShieldCheck, FileCheck2, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SignOutDialog } from "./SignOutDialog";

const browseItems = [
  { title: "Home", url: "/", icon: HomeIcon },
  { title: "Search Properties", url: "/search", icon: Search },
  { title: "All Properties", url: "/properties", icon: Building2 },
];

const userItems = [
  { title: "My Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Saved Properties", url: "/favorites", icon: Heart },
  { title: "Visit Requests", url: "/visits", icon: CalendarCheck },
  { title: "Chat", url: "/chat", icon: MessageCircle },
];

const ownerItems = [
  { title: "Owner Dashboard", url: "/owner-dashboard", icon: LayoutDashboard },
  { title: "My Properties", url: "/owner/properties", icon: Building2 },
  { title: "Add Property", url: "/owner/add", icon: Plus },
  { title: "Visit Requests", url: "/owner/visits", icon: CalendarCheck },
  { title: "Messages", url: "/chat", icon: MessageCircle },
];

const adminItems = [
  { title: "Admin Dashboard", url: "/admin-dashboard", icon: LayoutDashboard },
  { title: "Manage Users", url: "/admin/users", icon: Users },
  { title: "Property Approvals", url: "/admin/approvals", icon: ShieldCheck },
  { title: "Document Verification", url: "/admin/documents", icon: FileCheck2 },
];

export function AppSidebar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [signOutOpen, setSignOutOpen] = useState(false);

  const myItems = role === "admin" ? adminItems : role === "owner" ? ownerItems : userItems;
  const myLabel = role === "admin" ? "Admin" : role === "owner" ? "Owner" : "My Account";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-2 py-3 hover:opacity-80 transition"
        >
          <div className="h-9 w-9 rounded-lg bg-brand text-brand-foreground flex items-center justify-center">
            <HomeIcon className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold text-brand">EasyEstate</span>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {browseItems.map((i) => (
                <SidebarMenuItem key={i.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={i.url} end className={({ isActive }) => isActive ? "bg-sidebar-accent text-primary font-medium" : ""}>
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>{myLabel}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {myItems.map((i) => (
                  <SidebarMenuItem key={i.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={i.url} end className={({ isActive }) => isActive ? "bg-sidebar-accent text-primary font-medium" : ""}>
                        <i.icon className="h-4 w-4" />
                        <span>{i.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/ai-assistant" className={({ isActive }) => isActive ? "bg-sidebar-accent text-primary font-medium" : ""}>
                    <Sparkles className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 space-y-2">
        {user ? (
          <>
            <p className="text-xs text-muted-foreground px-2 truncate">{user.email}</p>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setSignOutOpen(true)}>
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
            <NavLink to="/settings" className="text-xs flex items-center gap-2 px-2 py-1 text-muted-foreground hover:text-foreground">
              <Settings className="h-3.5 w-3.5" /> Settings
            </NavLink>
          </>
        ) : (
          <>
            <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate("/auth")}>Login</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/auth?mode=register")}>Register</Button>
          </>
        )}
      </SidebarFooter>
      <SignOutDialog open={signOutOpen} onOpenChange={setSignOutOpen} />
    </Sidebar>
  );
}

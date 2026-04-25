import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AIAssistantWidget } from "./AIAssistantWidget";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
            <SidebarTrigger className="ml-3" />
            <span className="ml-3 font-display text-lg font-bold text-brand">EasyEstate</span>
          </header>
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
        <AIAssistantWidget />
      </div>
    </SidebarProvider>
  );
}

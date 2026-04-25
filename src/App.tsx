import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Protected } from "@/components/Protected";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import SearchPage from "./pages/SearchPage";
import AllProperties from "./pages/AllProperties";
import PropertyDetails from "./pages/PropertyDetails";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddProperty from "./pages/AddProperty";
import VisitsPage from "./pages/VisitsPage";
import FavoritesPage from "./pages/FavoritesPage";
import ChatPage from "./pages/ChatPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/properties" element={<AllProperties />} />
                  <Route path="/properties/:id" element={<PropertyDetails />} />
                  <Route path="/ai-assistant" element={<AIAssistantPage />} />
                  <Route path="/dashboard" element={<Protected roles={["user","owner","admin"]}><UserDashboard /></Protected>} />
                  <Route path="/favorites" element={<Protected><FavoritesPage /></Protected>} />
                  <Route path="/visits" element={<Protected><VisitsPage /></Protected>} />
                  <Route path="/chat" element={<Protected><ChatPage /></Protected>} />
                  <Route path="/settings" element={<Protected><Settings /></Protected>} />
                  <Route path="/owner-dashboard" element={<Protected roles={["owner","admin"]}><OwnerDashboard /></Protected>} />
                  <Route path="/owner/properties" element={<Protected roles={["owner","admin"]}><OwnerDashboard /></Protected>} />
                  <Route path="/owner/add" element={<Protected roles={["owner","admin"]}><AddProperty /></Protected>} />
                  <Route path="/owner/visits" element={<Protected roles={["owner","admin"]}><VisitsPage owner /></Protected>} />
                  <Route path="/admin-dashboard" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
                  <Route path="/admin/users" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
                  <Route path="/admin/approvals" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
                  <Route path="/admin/documents" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

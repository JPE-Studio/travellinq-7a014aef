
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import PostDetail from "./pages/PostDetail";
import MapView from "./pages/MapView";
import Chats from "./pages/Chats";
import Settings from "./pages/Settings";
import ChatScreen from "./pages/ChatScreen";
import Auth from "./pages/Auth";
import NewChat from "./pages/NewChat";
import UserDetail from "./pages/UserDetail";
import Notifications from "./pages/Notifications";
import { useEffect } from "react";
import { setupRlsPolicies } from "./utils/setupRlsPolicies";
import OnboardingCheck from "./components/OnboardingCheck";

const queryClient = new QueryClient();

// This component is responsible for setting up RLS policies
const RLSSetup = () => {
  useEffect(() => {
    // Only run this in a production or development environment, not in preview
    if (!window.location.host.includes('lovable.dev')) {
      setupRlsPolicies().then(() => {
        console.log("RLS policies setup complete");
      }).catch(err => {
        console.error("RLS setup error:", err);
      });
    }
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster position="top-center" />
        <Sonner position="bottom-center" />
        <RLSSetup />
        <OnboardingCheck /> {/* Add the onboarding check component */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            {/* Redirect from /profile/:userId to /users/:userId */}
            <Route path="/profile/:userId" element={<Navigate to={(location) => {
              const path = location.pathname.replace('/profile/', '/users/');
              return path;
            }} />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chats/new" element={<NewChat />} />
            <Route path="/chat/:conversationId" element={<ChatScreen />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users/:userId" element={<UserDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/notifications" element={<Notifications />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

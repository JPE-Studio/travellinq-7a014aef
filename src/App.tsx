
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chats/new" element={<NewChat />} />
            <Route path="/chat/:userId" element={<ChatScreen />} />
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

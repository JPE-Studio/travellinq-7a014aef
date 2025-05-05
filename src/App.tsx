
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
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
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import ReportsManagement from "./pages/admin/ReportsManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import RolesManagement from "./pages/admin/RolesManagement";
import DataExport from "./pages/admin/DataExport";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import BecomeAdmin from "./pages/BecomeAdmin";
import ProtectedRoute from "./components/ProtectedRoute";
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

// This component handles the redirect from /profile/:userId to /users/:userId
const ProfileRedirect = () => {
  const { userId } = useParams<{ userId: string }>();
  const targetPath = `/users/${userId}`;
  
  return <Navigate to={targetPath} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <RLSSetup />
        <OnboardingCheck />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            {/* Redirect from /profile/:userId to /users/:userId using a component */}
            <Route 
              path="/profile/:userId" 
              element={<ProfileRedirect />} 
            />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/chats/new" element={<NewChat />} />
            <Route path="/chat/:conversationId" element={<ChatScreen />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users/:userId" element={<UserDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/become-admin" element={<BecomeAdmin />} />
            
            {/* Admin Routes - Protected by role */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute minimumRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute minimumRole="admin">
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reports" 
              element={
                <ProtectedRoute minimumRole="moderator">
                  <ReportsManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/content" 
              element={
                <ProtectedRoute minimumRole="moderator">
                  <ContentManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/roles" 
              element={
                <ProtectedRoute minimumRole="admin">
                  <RolesManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/data" 
              element={
                <ProtectedRoute minimumRole="admin">
                  <DataExport />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/analytics" 
              element={
                <ProtectedRoute minimumRole="superadmin">
                  <AnalyticsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute minimumRole="admin">
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

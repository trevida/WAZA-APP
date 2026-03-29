import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import useAuthStore from "@/store/authStore";

// Public pages
import LandingPage from "@/pages/public/LandingPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";

// Dashboard pages
import DashboardLayout from "@/pages/dashboard/DashboardLayout";
import DashboardHome from "@/pages/dashboard/DashboardHome";
import AgentsPage from "@/pages/dashboard/AgentsPage";
import AgentNew from "@/pages/dashboard/AgentNew";
import AgentEdit from "@/pages/dashboard/AgentEdit";
import ContactsPage from "@/pages/dashboard/ContactsPage";
import ContactsImport from "@/pages/dashboard/ContactsImport";
import ConversationsPage from "@/pages/dashboard/ConversationsPage";
import ConversationDetail from "@/pages/dashboard/ConversationDetail";
import BroadcastsPage from "@/pages/dashboard/BroadcastsPage";
import BroadcastNew from "@/pages/dashboard/BroadcastNew";
import AnalyticsPage from "@/pages/dashboard/AnalyticsPage";
import BillingPage from "@/pages/dashboard/BillingPage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import OnboardingPage from "@/pages/dashboard/OnboardingPage";

import "@/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public route wrapper (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dashboard routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="onboarding" element={<OnboardingPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="agents/new" element={<AgentNew />} />
            <Route path="agents/:id" element={<AgentEdit />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="contacts/import" element={<ContactsImport />} />
            <Route path="conversations" element={<ConversationsPage />} />
            <Route path="conversations/:id" element={<ConversationDetail />} />
            <Route path="broadcasts" element={<BroadcastsPage />} />
            <Route path="broadcasts/new" element={<BroadcastNew />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

import React, { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import useAuthStore from "@/store/authStore";
import "@/i18n";

// Public pages
// Landing page: swap ComingSoonPage ↔ LandingPage to revert
// Original: import LandingPage from "@/pages/public/LandingPage";
import LandingPage from "@/pages/public/ComingSoonPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import TermsPage from "@/pages/public/TermsPage";
import ContactPage from "@/pages/public/ContactPage";
import AboutPage from "@/pages/public/AboutPage";
import VerifyEmailPage from "@/pages/public/VerifyEmailPage";

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
import TeamPage from "@/pages/dashboard/TeamPage";
import OnboardingPage from "@/pages/dashboard/OnboardingPage";

// Grow pages
import GrowOverview from "@/pages/dashboard/grow/GrowOverview";
import GrowCampaigns from "@/pages/dashboard/grow/GrowCampaigns";
import GrowCampaignNew from "@/pages/dashboard/grow/GrowCampaignNew";
import GrowCampaignDetail from "@/pages/dashboard/grow/GrowCampaignDetail";
import GrowConnect from "@/pages/dashboard/grow/GrowConnect";
import GrowPricingPage from "@/pages/public/GrowPricingPage";

// Admin pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminRevenuesPage from "@/pages/admin/AdminRevenuesPage";
import AdminWorkspacesPage from "@/pages/admin/AdminWorkspacesPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";
import AdminAuditLogPage from "@/pages/admin/AdminAuditLogPage";

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

// Admin route wrapper
const AdminRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const user = useAuthStore((state) => state.user);
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  if (!user?.is_superadmin) {
    return <Navigate to="/admin/login" replace />;
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
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
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
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/grow" element={<GrowPricingPage />} />

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
            <Route path="team" element={<TeamPage />} />
            <Route path="grow" element={<GrowOverview />} />
            <Route path="grow/campaigns" element={<GrowCampaigns />} />
            <Route path="grow/campaigns/new" element={<GrowCampaignNew />} />
            <Route path="grow/campaigns/:id" element={<GrowCampaignDetail />} />
            <Route path="grow/connect" element={<GrowConnect />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="revenues" element={<AdminRevenuesPage />} />
            <Route path="workspaces" element={<AdminWorkspacesPage />} />
            <Route path="audit-log" element={<AdminAuditLogPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;

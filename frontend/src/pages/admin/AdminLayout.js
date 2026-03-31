import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Vue d'ensemble", end: true },
  { to: "/admin/users", icon: Users, label: "Utilisateurs" },
  { to: "/admin/revenues", icon: DollarSign, label: "Revenus" },
  { to: "/admin/workspaces", icon: Building2, label: "Workspaces" },
  { to: "/admin/settings", icon: Settings, label: "Paramètres" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminService.getStats,
    refetchInterval: 60000,
  });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex" data-testid="admin-layout">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111118] border-r border-[#1E1E2E] transform transition-transform lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#1E1E2E]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[#FFD600] flex items-center justify-center">
              <span className="text-black font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg">
              WAZA <span className="text-[#FFD600] text-xs font-medium">ADMIN</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-[#FFD600]/10 text-[#FFD600] font-medium"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
              data-testid={`admin-nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#1E1E2E]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all"
            data-testid="admin-logout-btn"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-[#111118] border-b border-[#1E1E2E] flex items-center justify-between px-6 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-gray-500">MRR</span>
              <span className="text-sm font-semibold text-[#FFD600]">
                {stats?.mrr_fcfa?.toLocaleString() || "0"} FCFA
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-gray-500">Utilisateurs</span>
              <span className="text-sm font-semibold">{stats?.active_users || 0}</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs text-gray-500">Messages aujourd'hui</span>
              <span className="text-sm font-semibold">{stats?.messages_today || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-7 h-7 rounded-full bg-[#FFD600]/20 flex items-center justify-center">
              <span className="text-[#FFD600] text-xs font-bold">A</span>
            </div>
            <span className="hidden sm:inline">Admin</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

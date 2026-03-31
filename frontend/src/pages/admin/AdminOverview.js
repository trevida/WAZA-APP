import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import {
  Users,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Building2,
  Bot,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PLAN_COLORS = {
  free: "#6B7280",
  starter: "#3B82F6",
  pro: "#FFD600",
  business: "#10B981",
};

function KPICard({ icon: Icon, label, value, sub, color = "#FFD600" }) {
  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5" data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: adminService.getStats,
  });

  const { data: recentSignups } = useQuery({
    queryKey: ["admin-recent-signups"],
    queryFn: () => adminService.getRecentSignups(10),
  });

  const { data: topWorkspaces } = useQuery({
    queryKey: ["admin-top-workspaces"],
    queryFn: () => adminService.getTopWorkspaces(5),
  });

  const { data: messagesData } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: adminService.getMessages,
  });

  const planData = stats?.plan_distribution
    ? Object.entries(stats.plan_distribution).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: PLAN_COLORS[name] || "#6B7280",
      }))
    : [];

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FFD600]/30 border-t-[#FFD600] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-overview">
      <h1 className="text-xl font-bold">Vue d'ensemble</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Utilisateurs" value={stats?.total_users || 0} sub={`${stats?.signups_today || 0} aujourd'hui`} />
        <KPICard icon={CreditCard} label="MRR" value={`${(stats?.mrr_fcfa || 0).toLocaleString()} F`} sub={`$${stats?.mrr_usd || 0}`} color="#10B981" />
        <KPICard icon={TrendingUp} label="Abonnements actifs" value={stats?.active_subscriptions || 0} color="#3B82F6" />
        <KPICard icon={MessageSquare} label="Messages aujourd'hui" value={stats?.messages_today || 0} sub={`${stats?.total_messages || 0} total`} color="#F59E0B" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Messages chart */}
        <div className="lg:col-span-2 bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Messages (30 derniers jours)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={messagesData?.daily_stats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: "8px", color: "#fff" }} />
                <Line type="monotone" dataKey="count" stroke="#FFD600" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan distribution */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Répartition des plans</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                  {planData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: "8px", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {planData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="text-gray-400">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent signups */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Inscriptions récentes</h2>
          <div className="space-y-3">
            {(recentSignups || []).map((u) => (
              <div key={u.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E1E2E] flex items-center justify-center text-xs font-bold text-gray-400">
                    {u.full_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-white text-sm">{u.full_name}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  backgroundColor: PLAN_COLORS[u.plan] + "20",
                  color: PLAN_COLORS[u.plan],
                }}>
                  {u.plan}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top workspaces */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Top Workspaces</h2>
          <div className="space-y-3">
            {(topWorkspaces || []).map((ws, i) => (
              <div key={ws.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-[#FFD600]/10 text-[#FFD600] text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white">{ws.name}</p>
                    <p className="text-gray-500 text-xs">{ws.owner}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{ws.messages_this_month} msg</span>
              </div>
            ))}
            {(!topWorkspaces || topWorkspaces.length === 0) && (
              <p className="text-gray-500 text-sm">Aucune activité</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

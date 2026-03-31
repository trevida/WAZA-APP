import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { TrendingUp, Users, Target, Globe } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Cell,
} from "recharts";

const COLORS = ["#6B7280", "#3B82F6", "#FFD600", "#10B981"];

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-advanced-analytics"],
    queryFn: adminService.getAdvancedAnalytics,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#FFD600]/30 border-t-[#FFD600] rounded-full animate-spin" /></div>;
  }

  const heatmapData = (data?.activity_heatmap || []).map((v, i) => ({ hour: `${i}h`, messages: v }));

  const radialData = [
    { name: "Conversion", value: data?.conversion_rate || 0, fill: "#FFD600" },
    { name: "Rétention", value: data?.retention_rate || 0, fill: "#10B981" },
  ];

  return (
    <div className="space-y-6" data-testid="admin-analytics-page">
      <h1 className="text-xl font-bold">Analytics Avancés</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Target size={14} /> Taux de conversion</div>
          <div className="text-2xl font-bold text-[#FFD600]">{data?.conversion_rate || 0}%</div>
          <div className="text-xs text-gray-500">{data?.paid_users || 0} payants / {data?.total_users || 0} total</div>
        </div>
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><TrendingUp size={14} /> Rétention</div>
          <div className="text-2xl font-bold text-[#10B981]">{data?.retention_rate || 0}%</div>
          <div className="text-xs text-gray-500">Utilisateurs actifs</div>
        </div>
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Users size={14} /> Payants</div>
          <div className="text-2xl font-bold">{data?.paid_users || 0}</div>
          <div className="text-xs text-gray-500">Starter + Pro + Business</div>
        </div>
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1"><Globe size={14} /> Pays</div>
          <div className="text-2xl font-bold">{data?.countries?.length || 0}</div>
          <div className="text-xs text-gray-500">pays représentés</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Signup trend */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Inscriptions (30 jours)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.signup_trend || []}>
                <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FFD600" stopOpacity={0.3} /><stop offset="95%" stopColor="#FFD600" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 9 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="signups" stroke="#FFD600" fill="url(#sg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Funnel de conversion</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.conversion_funnel || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 10 }} />
                <YAxis dataKey="stage" type="category" tick={{ fill: "#6B7280", fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {(data?.conversion_funnel || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activity heatmap */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Activité par heure (30j)</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmapData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                <XAxis dataKey="hour" tick={{ fill: "#6B7280", fontSize: 9 }} interval={2} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: "8px", color: "#fff" }} />
                <Bar dataKey="messages" fill="#3B82F6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top agents */}
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Top Agents</h2>
          <div className="space-y-3">
            {(data?.top_agents || []).slice(0, 8).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded bg-[#FFD600]/10 text-[#FFD600] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div>
                    <span className="text-white">{a.name}</span>
                    <span className="ml-2 text-xs text-gray-500">{a.module}</span>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{a.messages} msg</span>
              </div>
            ))}
            {(!data?.top_agents || data.top_agents.length === 0) && <p className="text-gray-500 text-sm">Aucun agent actif</p>}
          </div>
        </div>
      </div>

      {/* Countries */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Répartition géographique</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(data?.countries || []).map((c, i) => (
            <div key={i} className="bg-[#0A0A0F] rounded-lg p-3 text-center">
              <div className="text-lg font-bold">{c.count}</div>
              <div className="text-xs text-gray-500">{c.country}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

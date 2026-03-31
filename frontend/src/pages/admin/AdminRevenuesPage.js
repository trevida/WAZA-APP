import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { DollarSign, TrendingUp, Download, FileDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const PLAN_COLORS = { free: "#6B7280", starter: "#3B82F6", pro: "#FFD600", business: "#10B981" };

export default function AdminRevenuesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-revenues"],
    queryFn: adminService.getRevenues,
  });

  const exportCSV = () => {
    if (!data?.transactions) return;
    const header = "Date,Utilisateur,Email,Montant,Devise,Provider,Statut\n";
    const rows = data.transactions.map((t) =>
      `${t.created_at},${t.user_name},${t.user_email},${t.amount},${t.currency},${t.provider},${t.status}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waza_revenues.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const revenueByPlan = data?.revenue_by_plan
    ? Object.entries(data.revenue_by_plan).map(([name, info]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        users: info.users,
        mrr: info.mrr_fcfa,
        color: PLAN_COLORS[name] || "#6B7280",
      }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#FFD600]/30 border-t-[#FFD600] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-revenues-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Revenus</h1>
        <div className="flex gap-2">
          <button onClick={() => { adminService.exportRevenuesPdf(); }} className="flex items-center gap-2 px-3 py-2 bg-[#111118] border border-[#1E1E2E] rounded-lg text-sm text-gray-300 hover:text-[#FFD600] hover:border-[#FFD600]/30 transition" data-testid="export-revenues-pdf-btn">
            <FileDown size={16} /> PDF
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-[#FFD600]/10 text-[#FFD600] rounded-lg text-sm hover:bg-[#FFD600]/20" data-testid="export-csv-btn">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase">MRR</p>
          <p className="text-2xl font-bold text-[#FFD600] mt-1">{(data?.mrr_fcfa || 0).toLocaleString()} FCFA</p>
          <p className="text-xs text-gray-500 mt-1">${data?.mrr_usd || 0} USD</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase">Revenu total</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{(data?.total_revenue_fcfa || 0).toLocaleString()} FCFA</p>
        </div>
        <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase">Transactions</p>
          <p className="text-2xl font-bold mt-1">{data?.transactions?.length || 0}</p>
        </div>
      </div>

      {/* Revenue by plan */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Revenu par plan</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByPlan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
              <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} />
              <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: "8px", color: "#fff" }} formatter={(v) => `${v.toLocaleString()} FCFA`} />
              <Bar dataKey="mrr" radius={[4, 4, 0, 0]}>
                {revenueByPlan.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1E1E2E]">
          <h2 className="text-sm font-semibold text-gray-300">Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="admin-transactions-table">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Utilisateur</th>
                <th className="px-4 py-3 text-left">Montant</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(data?.transactions || []).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Aucune transaction</td></tr>
              ) : (
                (data?.transactions || []).map((t) => (
                  <tr key={t.id} className="border-b border-[#1E1E2E]/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-gray-400 text-xs">{t.created_at ? new Date(t.created_at).toLocaleDateString("fr") : "-"}</td>
                    <td className="px-4 py-3">
                      <p className="text-white">{t.user_name}</p>
                      <p className="text-gray-500 text-xs">{t.user_email}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{t.amount?.toLocaleString()} {t.currency}</td>
                    <td className="px-4 py-3 text-gray-400">{t.provider}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${t.status === "paid" ? "text-green-400" : "text-yellow-400"}`}>{t.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

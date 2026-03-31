import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { ClipboardList, Search, ChevronLeft, ChevronRight } from "lucide-react";

const ACTION_LABELS = {
  user_suspended: { label: "Suspendu", color: "#EF4444" },
  user_reactivated: { label: "Réactivé", color: "#10B981" },
  user_deleted: { label: "Supprimé", color: "#EF4444" },
  plan_changed: { label: "Plan modifié", color: "#3B82F6" },
  payment_config_updated: { label: "Config paiement", color: "#F59E0B" },
  export_users_pdf: { label: "Export PDF users", color: "#8B5CF6" },
  export_revenues_pdf: { label: "Export PDF revenus", color: "#8B5CF6" },
};

export default function AdminAuditLogPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", page, filter],
    queryFn: () => adminService.getAuditLogs(page, 30, filter),
    keepPreviousData: true,
  });

  const totalPages = Math.ceil((data?.total || 0) / 30);

  const getActionStyle = (action) => {
    const info = ACTION_LABELS[action];
    return info || { label: action, color: "#6B7280" };
  };

  return (
    <div className="space-y-6" data-testid="admin-audit-log-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Journal d'audit</h1>
        <div className="text-sm text-gray-500">{data?.total || 0} entrées</div>
      </div>

      {/* Filter */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Filtrer par action..."
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="w-full bg-[#111118] border border-[#1E1E2E] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD600]/50"
          data-testid="audit-filter-input"
        />
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-gray-500 text-xs uppercase">
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Admin</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Cible</th>
                <th className="text-left px-4 py-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">Chargement...</td></tr>
              ) : (data?.logs || []).length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">
                  <ClipboardList className="mx-auto mb-2 w-8 h-8 text-gray-600" />
                  Aucune action enregistrée
                </td></tr>
              ) : (
                (data?.logs || []).map((log) => {
                  const style = getActionStyle(log.action);
                  return (
                    <tr key={log.id} className="border-b border-[#1E1E2E]/50 hover:bg-white/[.02]">
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {log.created_at ? new Date(log.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-300">{log.admin_email}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: style.color + '15', color: style.color }}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {log.target_type && <span className="text-gray-500">{log.target_type}</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">{log.details || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
            <span className="text-xs text-gray-500">Page {page}/{totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-1 rounded hover:bg-white/5 disabled:opacity-30" data-testid="audit-prev-btn">
                <ChevronLeft size={16} className="text-gray-400" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="p-1 rounded hover:bg-white/5 disabled:opacity-30" data-testid="audit-next-btn">
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

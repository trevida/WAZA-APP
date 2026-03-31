import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Search, ChevronLeft, ChevronRight, UserX, UserCheck, Crown, Trash2, Eye, X, FileDown } from "lucide-react";
import { toast } from "sonner";

const PLAN_COLORS = { free: "#6B7280", starter: "#3B82F6", pro: "#FFD600", business: "#10B981" };

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { search, plan: planFilter, page }],
    queryFn: () => adminService.getUsers({ search, plan: planFilter, page, per_page: 15 }),
  });

  const { data: userDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-user-detail", selectedUser],
    queryFn: () => adminService.getUserDetail(selectedUser),
    enabled: !!selectedUser,
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, suspend }) => adminService.suspendUser(userId, suspend),
    onSuccess: () => { queryClient.invalidateQueries(["admin-users"]); toast.success("Statut mis à jour"); },
  });

  const planMutation = useMutation({
    mutationFn: ({ userId, plan }) => adminService.changeUserPlan(userId, plan),
    onSuccess: () => { queryClient.invalidateQueries(["admin-users"]); toast.success("Plan mis à jour"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId) => adminService.deleteUser(userId),
    onSuccess: () => { queryClient.invalidateQueries(["admin-users"]); toast.success("Utilisateur supprimé"); setSelectedUser(null); },
  });

  return (
    <div className="space-y-6" data-testid="admin-users-page">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Utilisateurs</h1>
        <button
          onClick={() => { adminService.exportUsersPdf(); toast.success('Téléchargement PDF...'); }}
          className="flex items-center gap-2 px-3 py-2 bg-[#111118] border border-[#1E1E2E] rounded-lg text-sm text-gray-300 hover:text-[#FFD600] hover:border-[#FFD600]/30 transition"
          data-testid="export-users-pdf-btn"
        >
          <FileDown size={16} />
          Export PDF
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom ou email..."
            className="w-full pl-9 pr-4 py-2 bg-[#111118] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#FFD600] outline-none"
            data-testid="admin-users-search"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111118] border border-[#1E1E2E] rounded-lg text-sm text-white focus:border-[#FFD600] outline-none"
          data-testid="admin-users-plan-filter"
        >
          <option value="">Tous les plans</option>
          <option value="free">Free</option>
          <option value="starter">Starter</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="admin-users-table">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Pays</th>
                <th className="px-4 py-3 text-left">Inscrit</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Messages</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : (data?.users || []).length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Aucun utilisateur trouvé</td></tr>
              ) : (
                (data?.users || []).map((u) => (
                  <tr key={u.id} className="border-b border-[#1E1E2E]/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-medium">{u.full_name}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: (PLAN_COLORS[u.plan] || "#6B7280") + "20", color: PLAN_COLORS[u.plan] }}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.country}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString("fr") : "-"}</td>
                    <td className="px-4 py-3">
                      {u.is_active ? (
                        <span className="text-xs text-green-400">Actif</span>
                      ) : (
                        <span className="text-xs text-red-400">Suspendu</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{u.messages_used || 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedUser(u.id)} className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white" title="Détails">
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => suspendMutation.mutate({ userId: u.id, suspend: u.is_active })}
                          className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-yellow-400"
                          title={u.is_active ? "Suspendre" : "Réactiver"}
                        >
                          {u.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        {!u.is_superadmin && (
                          <select
                            defaultValue={u.plan}
                            onChange={(e) => planMutation.mutate({ userId: u.id, plan: e.target.value })}
                            className="bg-transparent text-xs text-gray-400 border border-[#1E1E2E] rounded px-1 py-0.5 outline-none"
                          >
                            <option value="free">Free</option>
                            <option value="starter">Starter</option>
                            <option value="pro">Pro</option>
                            <option value="business">Business</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
            <span className="text-xs text-gray-500">{data.total} utilisateurs</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-gray-400">{page} / {data.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} data-testid="admin-user-detail-modal">
            {detailLoading ? (
              <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-[#FFD600]/30 border-t-[#FFD600] rounded-full animate-spin mx-auto" /></div>
            ) : userDetail ? (
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{userDetail.full_name}</h2>
                    <p className="text-sm text-gray-400">{userDetail.email}</p>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Plan:</span> <span className="ml-2" style={{ color: PLAN_COLORS[userDetail.plan] }}>{userDetail.plan}</span></div>
                  <div><span className="text-gray-500">Pays:</span> <span className="ml-2">{userDetail.country}</span></div>
                  <div><span className="text-gray-500">Téléphone:</span> <span className="ml-2">{userDetail.phone || "-"}</span></div>
                  <div><span className="text-gray-500">Entreprise:</span> <span className="ml-2">{userDetail.company_name || "-"}</span></div>
                  <div><span className="text-gray-500">Statut:</span> <span className={`ml-2 ${userDetail.is_active ? "text-green-400" : "text-red-400"}`}>{userDetail.is_active ? "Actif" : "Suspendu"}</span></div>
                  <div><span className="text-gray-500">Inscrit:</span> <span className="ml-2">{userDetail.created_at ? new Date(userDetail.created_at).toLocaleDateString("fr") : "-"}</span></div>
                </div>

                {userDetail.workspaces?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Workspaces</h3>
                    <div className="space-y-2">
                      {userDetail.workspaces.map((ws) => (
                        <div key={ws.id} className="bg-[#0A0A0F] rounded-lg p-3 text-xs">
                          <p className="text-white font-medium">{ws.name}</p>
                          <p className="text-gray-500 mt-1">{ws.agents_count} agents · {ws.contacts_count} contacts · {ws.messages_this_month} msg/mois</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userDetail.payments?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2">Paiements récents</h3>
                    <div className="space-y-2">
                      {userDetail.payments.map((p) => (
                        <div key={p.id} className="flex justify-between text-xs bg-[#0A0A0F] rounded-lg p-3">
                          <span>{p.amount} {p.currency}</span>
                          <span className="text-gray-500">{p.provider}</span>
                          <span className={p.status === "paid" ? "text-green-400" : "text-gray-500"}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!userDetail.is_superadmin && (
                  <button
                    onClick={() => { if (window.confirm("Supprimer cet utilisateur ?")) deleteMutation.mutate(userDetail.id); }}
                    className="w-full py-2 bg-red-500/10 text-red-400 rounded-lg text-sm hover:bg-red-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} /> Supprimer l'utilisateur
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

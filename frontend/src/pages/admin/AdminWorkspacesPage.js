import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Building2, Wifi, WifiOff, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminWorkspacesPage() {
  const [whatsappFilter, setWhatsappFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = { page, per_page: 15 };
  if (whatsappFilter === "connected") params.whatsapp_connected = true;
  if (whatsappFilter === "not_connected") params.whatsapp_connected = false;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-workspaces", params],
    queryFn: () => adminService.getWorkspaces(params),
  });

  return (
    <div className="space-y-6" data-testid="admin-workspaces-page">
      <h1 className="text-xl font-bold">Workspaces</h1>

      <div className="flex gap-3">
        <select
          value={whatsappFilter}
          onChange={(e) => { setWhatsappFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-[#111118] border border-[#1E1E2E] rounded-lg text-sm text-white focus:border-[#FFD600] outline-none"
          data-testid="admin-ws-filter"
        >
          <option value="">Tous</option>
          <option value="connected">WhatsApp connecté</option>
          <option value="not_connected">WhatsApp non connecté</option>
        </select>
      </div>

      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="admin-workspaces-table">
            <thead>
              <tr className="border-b border-[#1E1E2E] text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Workspace</th>
                <th className="px-4 py-3 text-left">Propriétaire</th>
                <th className="px-4 py-3 text-center">WhatsApp</th>
                <th className="px-4 py-3 text-center">Agents</th>
                <th className="px-4 py-3 text-center">Contacts</th>
                <th className="px-4 py-3 text-center">Messages/mois</th>
                <th className="px-4 py-3 text-left">Créé</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Chargement...</td></tr>
              ) : (data?.workspaces || []).length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Aucun workspace</td></tr>
              ) : (
                (data?.workspaces || []).map((ws) => (
                  <tr key={ws.id} className="border-b border-[#1E1E2E]/50 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-medium">{ws.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300">{ws.owner_name}</p>
                      <p className="text-gray-500 text-xs">{ws.owner_email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ws.whatsapp_connected ? (
                        <Wifi size={16} className="inline text-green-400" />
                      ) : (
                        <WifiOff size={16} className="inline text-gray-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">{ws.agents_count}</td>
                    <td className="px-4 py-3 text-center text-gray-400">{ws.contacts_count}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-white">{ws.messages_this_month}</span>
                      <span className="text-gray-600">/{ws.message_limit}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{ws.created_at ? new Date(ws.created_at).toLocaleDateString("fr") : "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1E1E2E]">
            <span className="text-xs text-gray-500">{data.total} workspaces</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <span className="text-xs text-gray-400">{page} / {data.pages}</span>
              <button onClick={() => setPage((p) => Math.min(data.pages, p + 1))} disabled={page >= data.pages} className="p-1 rounded hover:bg-white/10 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Settings, Shield, Bell, Sliders } from "lucide-react";

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl" data-testid="admin-settings-page">
      <h1 className="text-xl font-bold">Paramètres</h1>

      {/* Platform Info */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={18} className="text-[#FFD600]" />
          <h2 className="text-sm font-semibold">Plateforme</h2>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nom de la plateforme</label>
          <input
            type="text"
            defaultValue="WAZA"
            className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white focus:border-[#FFD600] outline-none"
            data-testid="platform-name-input"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL Backend</label>
          <input
            type="text"
            defaultValue="https://earnest-creativity-production-e3cc.up.railway.app"
            className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-gray-500 cursor-not-allowed"
            disabled
          />
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Sliders size={18} className="text-[#FFD600]" />
          <h2 className="text-sm font-semibold">Mode maintenance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Activer le mode maintenance</p>
            <p className="text-xs text-gray-500">Affiche une page de maintenance à tous les utilisateurs</p>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`w-12 h-6 rounded-full transition-colors ${maintenanceMode ? "bg-[#FFD600]" : "bg-[#1E1E2E]"}`}
            data-testid="maintenance-toggle"
          >
            <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${maintenanceMode ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Bell size={18} className="text-[#FFD600]" />
          <h2 className="text-sm font-semibold">Annonce</h2>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Message à afficher aux utilisateurs</label>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            rows={3}
            placeholder="Ex: Maintenance prévue le 15 avril de 2h à 4h..."
            className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#FFD600] outline-none resize-none"
            data-testid="announcement-textarea"
          />
        </div>
      </div>

      {/* Plan Limits */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Settings size={18} className="text-[#FFD600]" />
          <h2 className="text-sm font-semibold">Limites des plans (lecture seule)</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { name: "Free", messages: 100, agents: 1, price: "0" },
            { name: "Starter", messages: 1500, agents: 1, price: "19,900" },
            { name: "Pro", messages: 8000, agents: 5, price: "49,900" },
            { name: "Business", messages: "Illimité", agents: "Illimité", price: "99,000" },
          ].map((plan) => (
            <div key={plan.name} className="bg-[#0A0A0F] rounded-lg p-3">
              <p className="font-semibold text-white">{plan.name}</p>
              <p className="text-xs text-gray-500 mt-1">{plan.messages} msg · {plan.agents} agents · {plan.price} FCFA</p>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-6 py-2.5 bg-[#FFD600] text-black font-semibold rounded-lg hover:bg-[#FFD600]/90 text-sm"
        data-testid="admin-settings-save"
      >
        {saved ? "Sauvegardé !" : "Sauvegarder"}
      </button>
    </div>
  );
}

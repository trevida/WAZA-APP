import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Settings, Shield, Bell, Sliders, CreditCard, Building, Landmark } from "lucide-react";
import { toast } from "sonner";

function Toggle({ enabled, onToggle, testId }) {
  return (
    <button
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${enabled ? "bg-[#FFD600]" : "bg-[#1E1E2E]"}`}
      data-testid={testId}
    >
      <span className={`block w-5 h-5 rounded-full bg-white shadow transform transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function MaskedInput({ label, value, onChange, testId, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#FFD600] outline-none"
        data-testid={testId}
      />
    </div>
  );
}

function TextInput({ label, value, onChange, testId, placeholder, disabled }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        disabled={disabled}
        className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#FFD600] outline-none disabled:text-gray-600 disabled:cursor-not-allowed"
        data-testid={testId}
      />
    </div>
  );
}

const CINETPAY_COUNTRIES = [
  "Côte d'Ivoire", "Cameroun", "Sénégal", "Burkina Faso",
  "Togo", "Mali", "Niger", "Congo",
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("platform");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const queryClient = useQueryClient();

  // Payment config state
  const [paymentForm, setPaymentForm] = useState({
    stripe_public_key: "", stripe_secret_key: "", stripe_webhook_secret: "", stripe_enabled: false,
    cinetpay_api_key: "", cinetpay_site_id: "", cinetpay_enabled: false,
    bank_name: "", bank_account_holder: "", bank_account_number: "",
    bank_iban: "", bank_swift: "", bank_instructions: "", bank_enabled: false,
  });

  const { data: paymentConfig } = useQuery({
    queryKey: ["admin-payment-config"],
    queryFn: adminService.getPaymentConfig,
  });

  useEffect(() => {
    if (paymentConfig) {
      setPaymentForm(paymentConfig);
    }
  }, [paymentConfig]);

  const updatePayment = useMutation({
    mutationFn: adminService.updatePaymentConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-payment-config"]);
      toast.success("Configuration paiement mise à jour");
    },
    onError: (err) => toast.error(err.response?.data?.detail || "Erreur"),
  });

  const pf = (field, value) => setPaymentForm((prev) => ({ ...prev, [field]: value }));

  const tabs = [
    { id: "platform", label: "Plateforme", icon: Shield },
    { id: "stripe", label: "Stripe", icon: CreditCard },
    { id: "cinetpay", label: "CinetPay", icon: Building },
    { id: "bank", label: "Virement", icon: Landmark },
  ];

  return (
    <div className="space-y-6" data-testid="admin-settings-page">
      <h1 className="text-xl font-bold">Paramètres</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#111118] border border-[#1E1E2E] rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-[#FFD600]/10 text-[#FFD600] font-medium"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
            data-testid={`settings-tab-${tab.id}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Platform Tab */}
      {activeTab === "platform" && (
        <div className="space-y-6 max-w-2xl">
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield size={18} className="text-[#FFD600]" />
              <h2 className="text-sm font-semibold">Plateforme</h2>
            </div>
            <TextInput label="Nom de la plateforme" value="WAZA" onChange={() => {}} testId="platform-name-input" disabled />
          </div>

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
              <Toggle enabled={maintenanceMode} onToggle={() => setMaintenanceMode(!maintenanceMode)} testId="maintenance-toggle" />
            </div>
          </div>

          <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Bell size={18} className="text-[#FFD600]" />
              <h2 className="text-sm font-semibold">Annonce</h2>
            </div>
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              rows={3}
              placeholder="Ex: Maintenance prévue le 15 avril de 2h à 4h..."
              className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#FFD600] outline-none resize-none"
              data-testid="announcement-textarea"
            />
          </div>

          <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Settings size={18} className="text-[#FFD600]" />
              <h2 className="text-sm font-semibold">Limites des plans</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { name: "Free", messages: 100, agents: 1, price: "0" },
                { name: "Starter", messages: "1,500", agents: 1, price: "19,900" },
                { name: "Pro", messages: "8,000", agents: 5, price: "49,900" },
                { name: "Business", messages: "Illimité", agents: "Illimité", price: "99,000" },
              ].map((plan) => (
                <div key={plan.name} className="bg-[#0A0A0F] rounded-lg p-3">
                  <p className="font-semibold text-white">{plan.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{plan.messages} msg · {plan.agents} agents · {plan.price} FCFA</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stripe Tab */}
      {activeTab === "stripe" && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-[#635BFF]" />
                <h2 className="text-sm font-semibold">Stripe</h2>
              </div>
              <Toggle enabled={paymentForm.stripe_enabled} onToggle={() => pf("stripe_enabled", !paymentForm.stripe_enabled)} testId="stripe-toggle" />
            </div>

            <TextInput label="Clé publique (Publishable Key)" value={paymentForm.stripe_public_key} onChange={(v) => pf("stripe_public_key", v)} testId="stripe-public-key" placeholder="pk_test_..." />
            <MaskedInput label="Clé secrète (Secret Key)" value={paymentForm.stripe_secret_key} onChange={(v) => pf("stripe_secret_key", v)} testId="stripe-secret-key" placeholder="sk_test_..." />
            <MaskedInput label="Webhook Secret" value={paymentForm.stripe_webhook_secret} onChange={(v) => pf("stripe_webhook_secret", v)} testId="stripe-webhook-secret" placeholder="whsec_..." />

            <button
              onClick={() => updatePayment.mutate({
                stripe_public_key: paymentForm.stripe_public_key,
                stripe_secret_key: paymentForm.stripe_secret_key,
                stripe_webhook_secret: paymentForm.stripe_webhook_secret,
                stripe_enabled: paymentForm.stripe_enabled,
              })}
              disabled={updatePayment.isPending}
              className="px-6 py-2 bg-[#635BFF] text-white font-semibold rounded-lg hover:bg-[#635BFF]/90 text-sm disabled:opacity-50"
              data-testid="stripe-save-btn"
            >
              {updatePayment.isPending ? "Sauvegarde..." : "Sauvegarder Stripe"}
            </button>
          </div>
        </div>
      )}

      {/* CinetPay Tab */}
      {activeTab === "cinetpay" && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building size={18} className="text-[#FF6B00]" />
                <h2 className="text-sm font-semibold">CinetPay (Mobile Money Afrique)</h2>
              </div>
              <Toggle enabled={paymentForm.cinetpay_enabled} onToggle={() => pf("cinetpay_enabled", !paymentForm.cinetpay_enabled)} testId="cinetpay-toggle" />
            </div>

            <MaskedInput label="API Key" value={paymentForm.cinetpay_api_key} onChange={(v) => pf("cinetpay_api_key", v)} testId="cinetpay-api-key" placeholder="CinetPay API Key" />
            <TextInput label="Site ID" value={paymentForm.cinetpay_site_id} onChange={(v) => pf("cinetpay_site_id", v)} testId="cinetpay-site-id" placeholder="123456" />
            <TextInput label="Notify URL" value={`${window.location.origin}/api/billing/webhook/cinetpay`} onChange={() => {}} testId="cinetpay-notify-url" disabled />

            <div>
              <label className="block text-xs text-gray-500 mb-2">Pays supportés</label>
              <div className="flex flex-wrap gap-2">
                {CINETPAY_COUNTRIES.map((c) => (
                  <span key={c} className="px-2.5 py-1 bg-[#FF6B00]/10 text-[#FF6B00] text-xs rounded-full">{c}</span>
                ))}
              </div>
            </div>

            <button
              onClick={() => updatePayment.mutate({
                cinetpay_api_key: paymentForm.cinetpay_api_key,
                cinetpay_site_id: paymentForm.cinetpay_site_id,
                cinetpay_enabled: paymentForm.cinetpay_enabled,
              })}
              disabled={updatePayment.isPending}
              className="px-6 py-2 bg-[#FF6B00] text-white font-semibold rounded-lg hover:bg-[#FF6B00]/90 text-sm disabled:opacity-50"
              data-testid="cinetpay-save-btn"
            >
              {updatePayment.isPending ? "Sauvegarde..." : "Sauvegarder CinetPay"}
            </button>
          </div>
        </div>
      )}

      {/* Bank Transfer Tab */}
      {activeTab === "bank" && (
        <div className="space-y-4 max-w-2xl">
          <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark size={18} className="text-[#10B981]" />
                <h2 className="text-sm font-semibold">Virement bancaire</h2>
              </div>
              <Toggle enabled={paymentForm.bank_enabled} onToggle={() => pf("bank_enabled", !paymentForm.bank_enabled)} testId="bank-toggle" />
            </div>

            <TextInput label="Nom de la banque" value={paymentForm.bank_name} onChange={(v) => pf("bank_name", v)} testId="bank-name" placeholder="Ex: SGBCI, BOA, Ecobank..." />
            <TextInput label="Nom du titulaire" value={paymentForm.bank_account_holder} onChange={(v) => pf("bank_account_holder", v)} testId="bank-holder" placeholder="Nom complet du titulaire" />
            <MaskedInput label="Numéro de compte" value={paymentForm.bank_account_number} onChange={(v) => pf("bank_account_number", v)} testId="bank-account" placeholder="Numéro de compte" />
            <MaskedInput label="IBAN" value={paymentForm.bank_iban} onChange={(v) => pf("bank_iban", v)} testId="bank-iban" placeholder="IBAN" />
            <TextInput label="BIC / SWIFT" value={paymentForm.bank_swift} onChange={(v) => pf("bank_swift", v)} testId="bank-swift" placeholder="Ex: SGBFCIAB" />

            <div>
              <label className="block text-xs text-gray-500 mb-1">Instructions de virement</label>
              <textarea
                value={paymentForm.bank_instructions}
                onChange={(e) => pf("bank_instructions", e.target.value)}
                rows={3}
                placeholder="Instructions pour le client lors du virement..."
                className="w-full px-4 py-2 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-sm text-white placeholder-gray-600 focus:border-[#FFD600] outline-none resize-none"
                data-testid="bank-instructions"
              />
            </div>

            <button
              onClick={() => updatePayment.mutate({
                bank_name: paymentForm.bank_name,
                bank_account_holder: paymentForm.bank_account_holder,
                bank_account_number: paymentForm.bank_account_number,
                bank_iban: paymentForm.bank_iban,
                bank_swift: paymentForm.bank_swift,
                bank_instructions: paymentForm.bank_instructions,
                bank_enabled: paymentForm.bank_enabled,
              })}
              disabled={updatePayment.isPending}
              className="px-6 py-2 bg-[#10B981] text-white font-semibold rounded-lg hover:bg-[#10B981]/90 text-sm disabled:opacity-50"
              data-testid="bank-save-btn"
            >
              {updatePayment.isPending ? "Sauvegarde..." : "Sauvegarder Virement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

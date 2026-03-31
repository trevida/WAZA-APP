import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services";
import useAuthStore from "@/store/authStore";
import { Lock, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      if (!data.user.is_superadmin) {
        setError("Accès réservé aux administrateurs.");
        setLoading(false);
        return;
      }
      setAuth(data.user, data.access_token, data.refresh_token);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4" data-testid="admin-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-[#FFD600] flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-bold text-2xl">W</span>
          </div>
          <h1 className="text-2xl font-bold text-white">WAZA Admin</h1>
          <p className="text-gray-500 mt-1 text-sm">Panneau d'administration</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 space-y-5"
          data-testid="admin-login-form"
        >
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg px-4 py-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-white text-sm placeholder-gray-600 focus:border-[#FFD600] focus:ring-1 focus:ring-[#FFD600] outline-none"
              placeholder="admin@waza.africa"
              required
              data-testid="admin-email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#0A0A0F] border border-[#1E1E2E] rounded-lg text-white text-sm placeholder-gray-600 focus:border-[#FFD600] focus:ring-1 focus:ring-[#FFD600] outline-none"
              placeholder="Mot de passe admin"
              required
              data-testid="admin-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#FFD600] text-black font-semibold rounded-lg hover:bg-[#FFD600]/90 transition-all disabled:opacity-50 text-sm"
            data-testid="admin-login-submit"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Connexion...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock size={16} />
                Accéder au panneau admin
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

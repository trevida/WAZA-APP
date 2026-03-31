import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/services/api';

const ComingSoonPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post('/grow/waitlist', { email });
      setSubmitted(true);
      toast.success('Inscription confirmee !');
    } catch {
      toast.success('Inscription confirmee !');
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070B] flex flex-col" data-testid="coming-soon-page">
      {/* Subtle grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}
      />

      {/* Radial glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#22C55E]/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-2/3 left-1/3 w-[400px] h-[400px] bg-[#EAB308]/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-16" data-testid="coming-soon-logo">
          <div className="w-12 h-12 bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-2xl flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-[#22C55E]" />
          </div>
          <span className="text-3xl font-black tracking-tight text-white">WAZA</span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-center tracking-tight leading-[1.1] mb-6 max-w-3xl"
          data-testid="coming-soon-headline"
        >
          <span className="text-white">Quelque chose de </span>
          <span className="bg-gradient-to-r from-[#22C55E] to-[#EAB308] bg-clip-text text-transparent">puissant</span>
          <span className="text-white"> arrive</span>
        </h1>

        {/* Subtext */}
        <p
          className="text-lg sm:text-xl text-[#8B8B9E] text-center max-w-xl mb-12 leading-relaxed"
          data-testid="coming-soon-subtext"
        >
          WAZA, ton agent commercial IA sur WhatsApp, arrive bientot.
          <br className="hidden sm:block" />
          Sois parmi les premiers.
        </p>

        {/* Email form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md flex flex-col sm:flex-row gap-3"
            data-testid="coming-soon-form"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              className="flex-1 bg-[#111118] border border-[#1E1E2E] rounded-xl px-5 py-3.5 text-white placeholder:text-[#4A4A5A] focus:outline-none focus:border-[#22C55E]/50 focus:ring-1 focus:ring-[#22C55E]/20 transition text-base"
              data-testid="coming-soon-email-input"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-[#07070B] font-bold px-6 py-3.5 rounded-xl transition-all whitespace-nowrap disabled:opacity-50 text-base"
              data-testid="coming-soon-submit-btn"
            >
              {loading ? 'Envoi...' : 'Me prevenir au lancement'}
            </button>
          </form>
        ) : (
          <div
            className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-xl px-8 py-5 text-center"
            data-testid="coming-soon-confirmed"
          >
            <p className="text-[#22C55E] font-bold text-lg mb-1">Tu es sur la liste !</p>
            <p className="text-[#8B8B9E] text-sm">On te previent des que WAZA est pret.</p>
          </div>
        )}

        {/* Small counter */}
        <p className="text-[#4A4A5A] text-sm mt-8">
          Rejoint 500+ entrepreneurs africains sur la liste d'attente
        </p>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center" data-testid="coming-soon-footer">
        <p className="text-[#4A4A5A] text-sm">
          &copy; 2026 WAZA &ndash; Massudom Silicon Valley
        </p>
      </footer>
    </div>
  );
};

export default ComingSoonPage;

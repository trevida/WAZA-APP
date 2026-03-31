import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageCircle, Check, Link2, Target, Rocket, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { growService } from '@/services/growService';
import LanguageToggle from '@/components/LanguageToggle';

const GrowPricingPage = () => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const { data: flags } = useQuery({ queryKey: ['grow-flags'], queryFn: growService.getFeatureFlags });
  const { data: countData } = useQuery({ queryKey: ['grow-waitlist-count'], queryFn: growService.getWaitlistCount });

  const isEnabled = flags?.grow_enabled;

  const plans = [
    {
      name: 'Starter', price: 15000, highlighted: false,
      features: ['Budget pub jusqu\'a 100,000 FCFA/mois', '2 campagnes actives', 'Ciblage IA automatique', 'Rapport WhatsApp hebdomadaire', 'Support email'],
    },
    {
      name: 'Pro', price: 35000, highlighted: true, badge: 'POPULAIRE',
      features: ['Budget pub jusqu\'a 500,000 FCFA/mois', 'Campagnes illimitees', 'Creation de visuels IA', 'Rapport WhatsApp quotidien', 'A/B testing automatique', 'Support prioritaire'],
    },
    {
      name: 'Agency', price: 75000, highlighted: false,
      features: ['Budget illimite', 'Jusqu\'a 10 comptes clients', 'Dashboard client separe', 'Rapport personnalise par client', 'Account manager dedie', 'White-label'],
    },
  ];

  const faqs = [
    { q: 'Est-ce que WAZA touche mon budget publicitaire ?', a: 'Non. Votre budget va directement a Facebook. WAZA ne prend aucune commission sur vos depenses publicitaires. Vous payez uniquement l\'abonnement WAZA Grow.' },
    { q: 'Puis-je fixer un budget maximum ?', a: 'Oui, vous definissez le budget max journalier ou total et l\'IA ne le depassera jamais. Vous gardez le controle total.' },
    { q: 'Dans quels pays puis-je faire de la pub ?', a: 'Tous les pays ou Facebook Ads est disponible. L\'IA optimise le ciblage pour votre audience specifique.' },
    { q: 'Faut-il des competences en marketing ?', a: 'Non! C\'est tout le principe de WAZA Grow. L\'IA gere tout: ciblage, optimisation, budget. Vous definissez l\'objectif, elle fait le reste.' },
  ];

  const handleWaitlist = async (e) => {
    e.preventDefault();
    if (!waitlistEmail) return;
    setSubmitting(true);
    try {
      await growService.joinWaitlist({ email: waitlistEmail });
      toast.success('Bienvenue sur la liste d\'attente!');
      setWaitlistEmail('');
    } catch { toast.error('Erreur, reessayez.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="glass-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MessageCircle className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-black">WAZA</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold">GROW</span>
            </Link>
            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <Link to="/login"><Button variant="ghost">Connexion</Button></Link>
              <Link to="/register"><Button>Essai gratuit</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-24 relative overflow-hidden" data-testid="grow-pricing-page">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-6">
            <Rocket className="w-4 h-4" /> WAZA Grow
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
            Vos publicites Facebook gerees par l'IA
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            Creez une campagne en 3 minutes. L'IA optimise 24h/24 pour maximiser votre ROI.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-surface/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Comment ca marche ?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Link2 className="w-6 h-6" />, num: '1', title: 'Connectez votre compte Facebook Ads', desc: '30 secondes pour lier votre compte. OAuth securise.' },
              { icon: <Target className="w-6 h-6" />, num: '2', title: 'Definissez objectif et budget', desc: '2 minutes pour configurer. L\'IA propose les meilleurs reglages.' },
              { icon: <Rocket className="w-6 h-6" />, num: '3', title: 'L\'IA lance et optimise', desc: 'En continu, 24h/24. Ajustements automatiques pour maximiser le ROI.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-400">{step.icon}</div>
                <div className="text-xs text-orange-400 font-bold mb-2">ETAPE {step.num}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-text-secondary text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Choisissez votre plan Grow</h2>
          <p className="text-text-secondary text-center mb-12">Votre abonnement WAZA Grow est separe de votre budget pub Facebook</p>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`bg-surface border ${plan.highlighted ? 'border-orange-500 shadow-lg shadow-orange-500/10' : 'border-border'} rounded-2xl p-6 relative ${plan.highlighted ? 'scale-105' : ''}`} data-testid={`grow-plan-${plan.name.toLowerCase()}`}>
                {plan.badge && <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">{plan.badge}</span>}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6"><span className="text-4xl font-black">{plan.price.toLocaleString()}</span><span className="text-text-muted"> FCFA/mois</span></div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2"><Check className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" /><span className="text-sm text-text-secondary">{f}</span></li>
                  ))}
                </ul>
                {isEnabled ? (
                  <Link to="/register"><Button className={`w-full ${plan.highlighted ? 'bg-orange-500 hover:bg-orange-600' : ''}`}>Commencer</Button></Link>
                ) : (
                  <Button disabled className="w-full opacity-60">Bientot disponible</Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist (if not enabled) */}
      {!isEnabled && (
        <section className="py-16 bg-surface/50">
          <div className="max-w-md mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Rejoindre la liste d'attente</h2>
            <p className="text-text-secondary mb-6">Soyez les premiers a tester WAZA Grow</p>
            <form onSubmit={handleWaitlist} className="flex gap-2">
              <input type="email" required value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} placeholder="votre@email.com" className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-orange-500" data-testid="grow-waitlist-input" />
              <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-600 px-6" data-testid="grow-waitlist-btn">{submitting ? '...' : 'Rejoindre'}</Button>
            </form>
            <p className="text-xs text-text-muted mt-3">Deja {countData?.count || 127} entreprises sur la liste</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Questions frequentes</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left" data-testid={`faq-${i}`}>
                  <span className="font-medium text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-sm text-text-secondary">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} WAZA by Massudom Silicon Valley. Tous droits reserves.
        </div>
      </footer>
    </div>
  );
};

export default GrowPricingPage;

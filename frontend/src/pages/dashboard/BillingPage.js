import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { billingService } from '@/services';
import useAuthStore from '@/store/authStore';
import useWorkspaceStore from '@/store/workspaceStore';

const BillingPage = () => {
  const user = useAuthStore((state) => state.user);
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: plans } = useQuery({
    queryKey: ['plans'],
    queryFn: billingService.getPlans,
  });

  const handleUpgrade = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async (provider) => {
    try {
      const response = await billingService.subscribe({
        plan: selectedPlan.name.toLowerCase(),
        payment_provider: provider,
      });
      
      window.location.href = response.checkout_url;
    } catch (error) {
      toast.error('Erreur lors de l\'initialisation du paiement');
    }
  };

  const currentPlan = plans?.find(p => p.name.toLowerCase() === user?.plan?.toLowerCase());

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold mb-2">Abonnement</h1>
      <p className="text-text-secondary mb-8">Gérez votre plan et votre facturation</p>

      {/* Current Plan */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Plan {currentPlan?.name}</h2>
            <p className="text-4xl font-black text-primary mb-1">
              {currentPlan?.price_fcfa.toLocaleString()} <span className="text-lg text-text-secondary">FCFA/mois</span>
            </p>
          </div>
          <CreditCard className="w-12 h-12 text-primary" />
        </div>

        {/* Usage Bar */}
        {currentWorkspace && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Messages utilisés</span>
              <span className="font-semibold">
                {currentWorkspace.monthly_message_count} / {currentWorkspace.message_limit === -1 ? '∞' : currentWorkspace.message_limit}
              </span>
            </div>
            <div className="w-full bg-surface-hover rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{
                  width: `${currentWorkspace.message_limit === -1 ? 20 : Math.min((currentWorkspace.monthly_message_count / currentWorkspace.message_limit) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* All Plans */}
      <h3 className="text-xl font-bold mb-6">Changer de plan</h3>
      <div className="grid grid-cols-4 gap-6">
        {plans?.map((plan) => {
          const isCurrent = plan.name.toLowerCase() === user?.plan?.toLowerCase();
          const isUpgrade = ['free', 'starter', 'pro', 'business'].indexOf(plan.name.toLowerCase()) >
                            ['free', 'starter', 'pro', 'business'].indexOf(user?.plan?.toLowerCase());

          return (
            <div
              key={plan.name}
              className={`bg-surface border rounded-2xl p-6 ${
                isCurrent ? 'border-primary' : 'border-border'
              }`}
            >
              <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
              <div className="text-3xl font-black mb-4">
                {plan.price_fcfa.toLocaleString()}
                <span className="text-sm text-text-muted"> FCFA/mois</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <Button variant="outline" disabled className="w-full">Plan actuel</Button>
              ) : isUpgrade ? (
                <Button onClick={() => handleUpgrade(plan)} className="w-full">Upgrader</Button>
              ) : (
                <Button variant="outline" className="w-full">Contacter</Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choisissez votre mode de paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <button
              onClick={() => handlePayment('stripe')}
              className="w-full p-6 bg-surface border border-border rounded-2xl hover:border-primary transition text-left"
            >
              <div className="font-bold mb-2">💳 Carte bancaire (Stripe)</div>
              <div className="text-sm text-text-secondary">Visa, Mastercard, American Express</div>
            </button>
            <button
              onClick={() => handlePayment('cinetpay')}
              className="w-full p-6 bg-surface border border-border rounded-2xl hover:border-primary transition text-left"
            >
              <div className="font-bold mb-2">📱 Mobile Money (CinetPay)</div>
              <div className="text-sm text-text-secondary">Orange Money, MTN, Moov, Wave</div>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillingPage;

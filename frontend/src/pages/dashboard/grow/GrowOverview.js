import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp, Eye, MousePointer, DollarSign, ShoppingCart, Rocket, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { growService } from '@/services/growService';

export default function GrowOverview() {
  const { data, isLoading } = useQuery({ queryKey: ['grow-overview'], queryFn: growService.getOverview });
  const { data: subData } = useQuery({ queryKey: ['grow-sub'], queryFn: growService.getSubscription });
  const { data: fbData } = useQuery({ queryKey: ['grow-fb'], queryFn: growService.getFbAccount });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;

  const sub = subData?.subscription;
  const fb = fbData?.account;

  if (!sub) {
    return (
      <div className="p-8 text-center" data-testid="grow-overview">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Rocket className="w-8 h-8 text-orange-400" /></div>
          <h2 className="text-2xl font-bold mb-3">Bienvenue sur WAZA Grow</h2>
          <p className="text-text-secondary mb-6">Commencez par choisir un plan pour gerer vos pubs Facebook avec l'IA.</p>
          <Link to="/grow"><Button className="bg-orange-500 hover:bg-orange-600">Voir les plans</Button></Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Campagnes', value: data?.total_campaigns || 0, icon: Rocket, color: '#F97316' },
    { label: 'Impressions', value: (data?.total_impressions || 0).toLocaleString(), icon: Eye, color: '#3B82F6' },
    { label: 'Clics', value: (data?.total_clicks || 0).toLocaleString(), icon: MousePointer, color: '#10B981' },
    { label: 'Depenses', value: `${(data?.total_spend || 0).toLocaleString()} F`, icon: DollarSign, color: '#F59E0B' },
    { label: 'Conversions', value: data?.total_conversions || 0, icon: ShoppingCart, color: '#8B5CF6' },
    { label: 'ROAS moyen', value: `${data?.avg_roas || 0}x`, icon: TrendingUp, color: '#EF4444' },
  ];

  return (
    <div className="p-8 space-y-6" data-testid="grow-overview">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WAZA Grow</h1>
          <p className="text-text-muted text-sm">Plan {sub.plan} — {fb ? `FB: ${fb.fb_account_name}` : 'Compte FB non connecte'}</p>
        </div>
        <Link to="/dashboard/grow/campaigns/new"><Button className="bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" />Nouvelle campagne</Button></Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><s.icon className="w-4 h-4" style={{ color: s.color }} /><span className="text-xs text-text-muted">{s.label}</span></div>
            <div className="text-2xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      {!fb && (
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6 text-center">
          <p className="text-orange-400 font-medium mb-3">Connectez votre compte Facebook Ads pour commencer</p>
          <Link to="/dashboard/grow/connect"><Button className="bg-orange-500 hover:bg-orange-600">Connecter Facebook</Button></Link>
        </div>
      )}

      {data?.active_campaigns === 0 && fb && (
        <div className="bg-surface border border-border rounded-xl p-6 text-center">
          <p className="text-text-secondary mb-3">Aucune campagne active. Lancez votre premiere campagne!</p>
          <Link to="/dashboard/grow/campaigns/new"><Button className="bg-orange-500 hover:bg-orange-600">Creer une campagne</Button></Link>
        </div>
      )}
    </div>
  );
}

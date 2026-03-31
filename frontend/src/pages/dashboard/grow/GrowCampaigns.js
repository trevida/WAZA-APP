import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Rocket, Pause, StopCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { growService } from '@/services/growService';

const STATUS_MAP = {
  draft: { label: 'Brouillon', color: '#6B7280', bg: '#6B728015' },
  active: { label: 'Active', color: '#10B981', bg: '#10B98115' },
  paused: { label: 'En pause', color: '#F59E0B', bg: '#F59E0B15' },
  completed: { label: 'Terminee', color: '#8B5CF6', bg: '#8B5CF615' },
};

export default function GrowCampaigns() {
  const { data, isLoading } = useQuery({ queryKey: ['grow-campaigns'], queryFn: growService.getCampaigns });
  const campaigns = data?.campaigns || [];

  return (
    <div className="p-8 space-y-6" data-testid="grow-campaigns">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campagnes</h1>
        <Link to="/dashboard/grow/campaigns/new"><Button className="bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" />Nouvelle</Button></Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>
      ) : campaigns.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <Rocket className="w-12 h-12 text-orange-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">Aucune campagne</h3>
          <p className="text-text-secondary mb-4">Creez votre premiere campagne publicitaire Facebook.</p>
          <Link to="/dashboard/grow/campaigns/new"><Button className="bg-orange-500 hover:bg-orange-600">Creer ma premiere campagne</Button></Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const s = STATUS_MAP[c.status] || STATUS_MAP.draft;
            const r = c.results || {};
            return (
              <Link key={c.id} to={`/dashboard/grow/campaigns/${c.id}`} className="bg-surface border border-border rounded-xl p-5 hover:border-orange-500/30 transition block" data-testid={`campaign-${c.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">{c.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>
                  </div>
                  <span className="text-xs text-text-muted">{c.objective}</span>
                </div>
                <div className="flex gap-6 text-sm text-text-secondary">
                  <span>Budget: {c.budget_fcfa?.toLocaleString()} FCFA/{c.budget_type === 'daily' ? 'jour' : 'total'}</span>
                  {r.impressions && <span>Impressions: {r.impressions?.toLocaleString()}</span>}
                  {r.clicks && <span>Clics: {r.clicks?.toLocaleString()}</span>}
                  {r.roas && <span className="text-orange-400 font-medium">ROAS: {r.roas}x</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

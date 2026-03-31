import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Eye, MousePointer, DollarSign, ShoppingCart, TrendingUp, Pause, Play, Square, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { growService } from '@/services/growService';

const STATUS_MAP = {
  draft: { label: 'Brouillon', color: '#6B7280' },
  active: { label: 'Active', color: '#10B981' },
  paused: { label: 'En pause', color: '#F59E0B' },
  completed: { label: 'Terminee', color: '#8B5CF6' },
};

export default function GrowCampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useQuery({ queryKey: ['grow-campaign', id], queryFn: () => growService.getCampaign(id) });

  const statusMutation = useMutation({
    mutationFn: (status) => growService.updateCampaignStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries(['grow-campaign', id]); toast.success('Statut mis a jour'); },
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" /></div>;
  if (!campaign) return <div className="p-8 text-center text-text-muted">Campagne introuvable</div>;

  const r = campaign.results || {};
  const s = STATUS_MAP[campaign.status] || STATUS_MAP.draft;
  const dailyStats = r.daily_stats || [];

  // WhatsApp Report Preview
  const reportPreview = r.impressions ? `📊 Rapport WAZA Grow\n\n🎯 Campagne: ${campaign.name}\n👥 Personnes touchees: ${r.reach?.toLocaleString() || 0}\n👆 Clics: ${r.clicks?.toLocaleString() || 0}\n💰 Depenses: ${r.spend?.toLocaleString() || 0} FCFA\n📈 ROAS: ${r.roas || 0}x\n\n💡 Recommandation IA:\nVotre pub performe ${r.roas > 3 ? 'tres bien' : 'correctement'}!\n${r.roas > 3 ? 'Augmenter le budget de 20% pourrait vous apporter 40% de resultats en plus.' : 'Essayez de modifier le visuel pour ameliorer le taux de clic.'}` : null;

  return (
    <div className="p-8 space-y-6" data-testid="grow-campaign-detail">
      <button onClick={() => navigate('/dashboard/grow/campaigns')} className="flex items-center text-text-muted hover:text-primary"><ArrowLeft className="w-4 h-4 mr-2" />Retour</button>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: s.color + '15', color: s.color }}>{s.label}</span>
          </div>
          <p className="text-text-muted text-sm capitalize">{campaign.objective} — {campaign.budget_fcfa?.toLocaleString()} FCFA/{campaign.budget_type === 'daily' ? 'jour' : 'total'}</p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'draft' && <Button onClick={() => statusMutation.mutate('active')} className="bg-green-600 hover:bg-green-700" data-testid="campaign-activate-btn"><Play className="w-4 h-4 mr-2" />Activer</Button>}
          {campaign.status === 'active' && <Button onClick={() => statusMutation.mutate('paused')} variant="outline"><Pause className="w-4 h-4 mr-2" />Pause</Button>}
          {campaign.status === 'paused' && <Button onClick={() => statusMutation.mutate('active')} className="bg-green-600 hover:bg-green-700"><Play className="w-4 h-4 mr-2" />Reprendre</Button>}
          {(campaign.status === 'active' || campaign.status === 'paused') && <Button onClick={() => statusMutation.mutate('completed')} variant="outline" className="text-red-400 border-red-400/30"><Square className="w-4 h-4 mr-2" />Arreter</Button>}
        </div>
      </div>

      {/* Stats Cards */}
      {r.impressions ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Portee', value: (r.reach || 0).toLocaleString(), icon: Eye, color: '#3B82F6' },
              { label: 'Clics', value: (r.clicks || 0).toLocaleString(), icon: MousePointer, color: '#10B981' },
              { label: 'Depenses', value: `${(r.spend || 0).toLocaleString()} F`, icon: DollarSign, color: '#F59E0B' },
              { label: 'Conversions', value: r.conversions || 0, icon: ShoppingCart, color: '#8B5CF6' },
              { label: 'ROAS', value: `${r.roas || 0}x`, icon: TrendingUp, color: '#EF4444' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1"><stat.icon className="w-4 h-4" style={{ color: stat.color }} /><span className="text-xs text-text-muted">{stat.label}</span></div>
                <div className="text-xl font-bold">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          {dailyStats.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-4">Performance dans le temps</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff' }} />
                    <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} dot={false} name="Clics" />
                    <Line type="monotone" dataKey="conversions" stroke="#F97316" strokeWidth={2} dot={false} name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-orange-400" /><span className="font-bold text-sm">Recommandation IA</span></div>
            <p className="text-sm text-text-secondary">
              {r.roas > 3 ? '💡 Votre campagne performe excellemment! Augmenter le budget de 20% pourrait vous apporter 40% de resultats en plus.' :
               r.roas > 1.5 ? '💡 Performance correcte. Essayez de modifier votre visuel ou d\'elargir votre audience pour ameliorer les resultats.' :
               '💡 Les resultats peuvent etre ameliores. Considerez changer l\'audience cible ou tester un nouveau creatif.'}
            </p>
          </div>

          {/* WhatsApp Report Preview */}
          {reportPreview && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-secondary mb-3">Apercu rapport WhatsApp hebdomadaire</h3>
              <div className="bg-[#0B141A] rounded-xl p-4 max-w-sm" data-testid="whatsapp-report-preview">
                <div className="bg-[#1F2C34] rounded-lg p-3 text-sm text-[#E9EDEF] whitespace-pre-line leading-relaxed">{reportPreview}</div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-surface border border-border rounded-xl p-8 text-center">
          <p className="text-text-secondary mb-3">Activez la campagne pour commencer a generer des resultats.</p>
          {campaign.status === 'draft' && <Button onClick={() => statusMutation.mutate('active')} className="bg-orange-500 hover:bg-orange-600"><Play className="w-4 h-4 mr-2" />Activer la campagne</Button>}
        </div>
      )}
    </div>
  );
}

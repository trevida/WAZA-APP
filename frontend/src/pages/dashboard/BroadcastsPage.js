import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Send, Clock, CheckCircle, FlaskConical, Trash2, X, Calendar, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { broadcastService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const BroadcastsPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const queryClient = useQueryClient();
  const [statsOpen, setStatsOpen] = useState(null);

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['broadcasts', currentWorkspace?.id],
    queryFn: () => broadcastService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const { data: statsData } = useQuery({
    queryKey: ['broadcast-stats', statsOpen],
    queryFn: () => broadcastService.getStats(statsOpen),
    enabled: !!statsOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: broadcastService.delete,
    onSuccess: () => { queryClient.invalidateQueries(['broadcasts']); toast.success('Broadcast supprime'); },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Erreur'),
  });

  const cancelMutation = useMutation({
    mutationFn: broadcastService.cancelSchedule,
    onSuccess: () => { queryClient.invalidateQueries(['broadcasts']); toast.success('Programmation annulee'); },
  });

  const statusConfig = {
    draft: { icon: Clock, color: 'text-text-muted', bg: 'bg-gray-500/10', label: 'Brouillon' },
    scheduled: { icon: Calendar, color: 'text-accent', bg: 'bg-accent/10', label: 'Programme' },
    sending: { icon: Loader2, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'En cours' },
    sent: { icon: CheckCircle, color: 'text-primary', bg: 'bg-primary/10', label: 'Envoye' },
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2" data-testid="broadcasts-title">Campagnes Broadcast</h1>
          <p className="text-text-secondary">Gerez vos campagnes de messages en masse</p>
        </div>
        <Link to="/dashboard/broadcasts/new">
          <Button data-testid="broadcast-new-btn">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">Chargement...</div>
      ) : broadcasts && broadcasts.length > 0 ? (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Envoyes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((broadcast) => {
                const cfg = statusConfig[broadcast.status] || statusConfig.draft;
                const StatusIcon = cfg.icon;
                return (
                  <TableRow key={broadcast.id} className="group">
                    <TableCell className="font-medium max-w-xs">
                      <div className="truncate">{broadcast.message_template}</div>
                      {broadcast.target_tags?.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {broadcast.target_tags.map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {broadcast.ab_test_enabled ? (
                        <Badge className="bg-accent/10 text-accent border-accent/30">
                          <FlaskConical className="w-3 h-3 mr-1" /> A/B
                        </Badge>
                      ) : (
                        <Badge variant="outline">Standard</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className={`w-3 h-3 ${broadcast.status === 'sending' ? 'animate-spin' : ''}`} />
                        {cfg.label}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted text-sm">
                      {broadcast.sent_at ? new Date(broadcast.sent_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : broadcast.scheduled_at ? (
                          <span className="text-accent">{new Date(broadcast.scheduled_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        ) : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">{broadcast.total_sent || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1.5">
                        {broadcast.status === 'sent' && (
                          <Button variant="ghost" size="sm" onClick={() => setStatsOpen(statsOpen === broadcast.id ? null : broadcast.id)} data-testid={`broadcast-stats-${broadcast.id}`}>
                            <Trophy className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {broadcast.status === 'scheduled' && (
                          <Button variant="ghost" size="sm" onClick={() => cancelMutation.mutate(broadcast.id)} data-testid={`broadcast-cancel-${broadcast.id}`}>
                            <X className="w-3.5 h-3.5 text-accent" />
                          </Button>
                        )}
                        {['draft', 'scheduled'].includes(broadcast.status) && (
                          <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(broadcast.id)} data-testid={`broadcast-delete-${broadcast.id}`}>
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Stats Panel */}
          {statsOpen && statsData && (
            <div className="border-t border-border p-6 bg-[#0A0A0F]" data-testid="broadcast-stats-panel">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm">Statistiques</h3>
                <Button variant="ghost" size="sm" onClick={() => setStatsOpen(null)}><X className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <StatCard label="Envoyes" value={statsData.total_sent} />
                <StatCard label="Delivres" value={statsData.total_delivered} />
                <StatCard label="Taux de livraison" value={`${statsData.delivery_rate}%`} />
              </div>

              {statsData.ab_test && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-accent" /> Resultats A/B
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <VariantCard
                      label="Variante A"
                      color="primary"
                      template={statsData.ab_test.variant_a.template}
                      sent={statsData.ab_test.variant_a.sent}
                      delivered={statsData.ab_test.variant_a.delivered}
                      replied={statsData.ab_test.variant_a.replied}
                      replyRate={statsData.ab_test.variant_a.reply_rate}
                      isWinner={statsData.ab_test.winner === 'A'}
                    />
                    <VariantCard
                      label="Variante B"
                      color="accent"
                      template={statsData.ab_test.variant_b.template}
                      sent={statsData.ab_test.variant_b.sent}
                      delivered={statsData.ab_test.variant_b.delivered}
                      replied={statsData.ab_test.variant_b.replied}
                      replyRate={statsData.ab_test.variant_b.reply_rate}
                      isWinner={statsData.ab_test.winner === 'B'}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-16 text-center" data-testid="broadcasts-empty">
          <Send className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune campagne</h3>
          <p className="text-text-secondary mb-6">Creez votre premiere campagne de broadcast</p>
          <Link to="/dashboard/broadcasts/new">
            <Button data-testid="broadcast-empty-new-btn">
              <Plus className="w-4 h-4 mr-2" /> Creer une campagne
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value }) => (
  <div className="bg-[#111118] border border-[#1E1E2E] rounded-lg p-3">
    <div className="text-xs text-text-muted">{label}</div>
    <div className="text-lg font-bold">{value}</div>
  </div>
);

const VariantCard = ({ label, color, template, sent, delivered, replied, replyRate, isWinner }) => (
  <div className={`bg-${color}/5 border ${isWinner ? `border-${color}/60 ring-1 ring-${color}/30` : `border-${color}/20`} rounded-xl p-4 relative`}>
    {isWinner && (
      <div className={`absolute -top-2 -right-2 bg-${color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
        <Trophy className="w-3 h-3" /> Gagnant
      </div>
    )}
    <div className={`text-xs font-bold text-${color} mb-2`}>{label}</div>
    <p className="text-xs text-text-muted line-clamp-2 mb-3">{template}</p>
    <div className="grid grid-cols-2 gap-2 text-xs">
      <div><span className="text-text-muted">Envoyes:</span> <span className="font-medium">{sent}</span></div>
      <div><span className="text-text-muted">Delivres:</span> <span className="font-medium">{delivered}</span></div>
      <div><span className="text-text-muted">Reponses:</span> <span className="font-medium">{replied}</span></div>
      <div><span className="text-text-muted">Taux:</span> <span className="font-bold">{replyRate}%</span></div>
    </div>
  </div>
);

export default BroadcastsPage;

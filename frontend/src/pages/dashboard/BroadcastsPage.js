import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Send, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { broadcastService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const BroadcastsPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['broadcasts', currentWorkspace?.id],
    queryFn: () => broadcastService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const statusIcons = {
    draft: { icon: Clock, color: 'text-text-muted', label: 'Brouillon' },
    scheduled: { icon: Clock, color: 'text-accent', label: 'Programmé' },
    sent: { icon: CheckCircle, color: 'text-primary', label: 'Envoyé' },
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Campagnes Broadcast</h1>
          <p className="text-text-secondary">Gérez vos campagnes de messages en masse</p>
        </div>
        <Link to="/dashboard/broadcasts/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle campagne
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          Chargement...
        </div>
      ) : broadcasts && broadcasts.length > 0 ? (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Envoyés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((broadcast) => {
                const StatusIcon = statusIcons[broadcast.status]?.icon;
                return (
                  <TableRow key={broadcast.id}>
                    <TableCell className="font-medium max-w-md">
                      <div className="truncate">{broadcast.message_template}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {broadcast.target_tags?.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {StatusIcon && <StatusIcon className={`w-4 h-4 ${statusIcons[broadcast.status].color}`} />}
                        <span className="capitalize">{statusIcons[broadcast.status]?.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted text-sm">
                      {broadcast.sent_at
                        ? new Date(broadcast.sent_at).toLocaleDateString('fr-FR')
                        : broadcast.scheduled_at
                        ? new Date(broadcast.scheduled_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {broadcast.total_sent || 0}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-16 text-center">
          <Send className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Aucune campagne</h3>
          <p className="text-text-secondary mb-6">Créez votre première campagne de broadcast</p>
          <Link to="/dashboard/broadcasts/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Créer une campagne
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default BroadcastsPage;

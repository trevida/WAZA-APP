import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Bot, MessageCircle, Calendar, DollarSign, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { agentService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const moduleIcons = {
  sell: { icon: Bot, color: 'bg-primary/10 text-primary' },
  remind: { icon: Calendar, color: 'bg-blue-500/10 text-blue-500' },
  collect: { icon: DollarSign, color: 'bg-orange-500/10 text-orange-500' },
  broadcast: { icon: Megaphone, color: 'bg-purple-500/10 text-purple-500' },
};

const AgentsPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);

  const { data: agents, isLoading } = useQuery({
    queryKey: ['agents', currentWorkspace?.id],
    queryFn: () => agentService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-surface rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Agents IA</h1>
          <p className="text-text-secondary">Gérez vos agents WhatsApp intelligents</p>
        </div>
        <Link to="/dashboard/agents/new">
          <Button data-testid="create-agent-button">
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Agent
          </Button>
        </Link>
      </div>

      {/* Agents Grid */}
      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => {
            const ModuleIcon = moduleIcons[agent.module]?.icon || Bot;
            const moduleColor = moduleIcons[agent.module]?.color || 'bg-primary/10 text-primary';

            return (
              <Link
                key={agent.id}
                to={`/dashboard/agents/${agent.id}`}
                className="block"
              >
                <div className="bg-surface border border-border rounded-2xl p-6 hover-lift hover:border-primary/30 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl ${moduleColor} flex items-center justify-center`}>
                      <ModuleIcon className="w-6 h-6" />
                    </div>
                    <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                      {agent.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-2">{agent.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="capitalize">
                      {agent.module}
                    </Badge>
                    <Badge variant="outline">
                      {agent.language === 'both' ? 'FR/EN' : agent.language.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-text-secondary text-sm line-clamp-2">
                    {agent.system_prompt}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-border flex items-center text-text-muted text-sm">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>Conversations actives</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Aucun agent pour le moment</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Créez votre premier agent IA pour commencer à automatiser vos conversations WhatsApp
          </p>
          <Link to="/dashboard/agents/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Créer mon premier agent
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AgentsPage;

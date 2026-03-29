import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { conversationService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const ConversationsPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [filter, setFilter] = useState('all');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', currentWorkspace?.id],
    queryFn: () => conversationService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const filteredConversations = conversations?.filter(conv => {
    if (filter === 'open') return conv.status === 'open';
    if (filter === 'closed') return conv.status === 'closed';
    return true;
  }) || [];

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-2">Conversations</h1>
        <p className="text-text-secondary mb-8">Toutes vos conversations WhatsApp</p>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['all', 'open', 'closed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg transition ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface hover:bg-surface-hover'
              }`}
            >
              {f === 'all' ? 'Toutes' : f === 'open' ? 'Ouvertes' : 'Fermées'}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-surface rounded-2xl"></div>)}
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="space-y-3">
            {filteredConversations.map((conv) => (
              <Link
                key={conv.id}
                to={`/dashboard/conversations/${conv.id}`}
                className="block bg-surface border border-border rounded-2xl p-4 hover-lift hover:border-primary/30 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Contact {conv.contact_id.substring(0, 8)}</div>
                      <div className="text-sm text-text-muted">
                        {new Date(conv.updated_at).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <Badge variant={conv.status === 'open' ? 'default' : 'secondary'}>
                    {conv.status === 'open' ? 'Ouverte' : 'Fermée'}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface border border-border rounded-2xl">
            <MessageCircle className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">Aucune conversation pour le moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;

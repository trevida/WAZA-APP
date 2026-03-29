import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conversationService } from '@/services';
import { toast } from 'sonner';

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.getMessages(id),
  });

  const closeMutation = useMutation({
    mutationFn: () => conversationService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversation']);
      queryClient.invalidateQueries(['conversations']);
      toast.success('Conversation fermée');
      navigate('/dashboard/conversations');
    },
  });

  if (isLoading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/conversations')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="font-bold">Conversation</h2>
            <p className="text-sm text-text-muted">
              {conversation?.status === 'open' ? 'Active' : 'Fermée'}
            </p>
          </div>
        </div>
        {conversation?.status === 'open' && (
          <Button variant="outline" onClick={() => closeMutation.mutate()}>
            Fermer la conversation
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {conversation?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-surface text-text-primary rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;

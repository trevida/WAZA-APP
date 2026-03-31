import React, { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { conversationService } from '@/services';
import { useConversationWS } from '@/hooks/useWebSocket';
import { toast } from 'sonner';

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationService.getMessages(id),
  });

  const { messages: wsMessages, isTyping, connected } = useConversationWS(id);

  const closeMutation = useMutation({
    mutationFn: () => conversationService.close(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversation']);
      queryClient.invalidateQueries(['conversations']);
      toast.success('Conversation fermée');
      navigate('/dashboard/conversations');
    },
  });

  // Merge API messages + WS live messages
  const apiMessages = conversation?.messages || [];
  const allMessages = [...apiMessages];
  wsMessages.forEach((wsMsg) => {
    if (!allMessages.some((m) => m.id === wsMsg.id)) {
      allMessages.push(wsMsg);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages.length, isTyping]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="h-screen flex flex-col bg-background" data-testid="conversation-detail">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/conversations')} data-testid="conv-back-btn">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold">Conversation</h2>
              {connected ? (
                <span className="flex items-center gap-1 text-xs text-green-500" data-testid="ws-connected">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-text-muted" data-testid="ws-disconnected">
                  <WifiOff className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted">
              {conversation?.status === 'open' ? 'Active' : 'Fermée'}
            </p>
          </div>
        </div>
        {conversation?.status === 'open' && (
          <Button variant="outline" onClick={() => closeMutation.mutate()} data-testid="conv-close-btn">
            Fermer la conversation
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {allMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              data-testid={`msg-${msg.role}-${msg.id}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-surface border border-border text-text-primary rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start" data-testid="typing-indicator">
              <div className="bg-surface border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-text-muted">L'agent est en train d'écrire...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {allMessages.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-text-muted">
          Aucun message dans cette conversation
        </div>
      )}
    </div>
  );
};

export default ConversationDetail;

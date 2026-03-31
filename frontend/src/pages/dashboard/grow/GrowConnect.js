import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Facebook, Check, Unplug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { growService } from '@/services/growService';

export default function GrowConnect() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);

  const { data: fbData } = useQuery({ queryKey: ['grow-fb'], queryFn: growService.getFbAccount });
  const fb = fbData?.account;

  const connectMutation = useMutation({
    mutationFn: () => growService.connectFb({
      fb_account_id: 'act_' + Math.random().toString(36).substr(2, 12),
      fb_account_name: 'Mon Compte Facebook Ads',
      access_token: 'mock_fb_token_' + Date.now(),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['grow-fb']);
      toast.success('Compte Facebook connecte!');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: growService.disconnectFb,
    onSuccess: () => {
      queryClient.invalidateQueries(['grow-fb']);
      toast.success('Compte deconnecte');
    },
  });

  const handleConnect = async () => {
    setConnecting(true);
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 2000));
    await connectMutation.mutateAsync();
    setConnecting(false);
  };

  return (
    <div className="p-8 max-w-lg mx-auto" data-testid="grow-connect">
      <h1 className="text-2xl font-bold mb-6">Connexion Facebook Ads</h1>

      {fb ? (
        <div className="bg-surface border border-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center"><Facebook className="w-6 h-6 text-blue-500" /></div>
            <div>
              <div className="font-bold">{fb.fb_account_name}</div>
              <div className="text-xs text-text-muted">ID: {fb.fb_account_id}</div>
            </div>
            <Check className="w-5 h-5 text-green-500 ml-auto" />
          </div>
          <div className="text-sm text-text-secondary">Connecte le {fb.connected_at ? new Date(fb.connected_at).toLocaleDateString('fr-FR') : '-'}</div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/dashboard/grow/campaigns/new')} className="flex-1 bg-orange-500 hover:bg-orange-600">Creer une campagne</Button>
            <Button variant="outline" onClick={() => disconnectMutation.mutate()} className="text-red-400 border-red-400/30"><Unplug className="w-4 h-4" /></Button>
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto"><Facebook className="w-10 h-10 text-blue-500" /></div>
          <div>
            <h2 className="text-xl font-bold mb-2">Connectez votre compte</h2>
            <p className="text-text-secondary text-sm">Liez votre compte Facebook Business pour que l'IA puisse gerer vos publicites.</p>
          </div>
          <Button onClick={handleConnect} disabled={connecting} className="bg-blue-600 hover:bg-blue-700 px-8" data-testid="fb-connect-btn">
            <Facebook className="w-4 h-4 mr-2" />
            {connecting ? 'Connexion en cours...' : 'Se connecter avec Facebook'}
          </Button>
          <p className="text-xs text-text-muted">WAZA ne touche jamais votre budget pub. Connexion securisee via OAuth.</p>
        </div>
      )}
    </div>
  );
}

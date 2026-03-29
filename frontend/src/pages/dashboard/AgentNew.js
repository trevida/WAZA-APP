import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { agentService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const defaultPrompts = {
  sell: "Tu es un assistant commercial professionnel pour une entreprise africaine. Ton rôle est de qualifier les prospects, répondre aux questions sur les produits, et conduire les clients vers l'achat. Sois courtois, professionnel et persuasif.",
  remind: "Tu es un assistant de rappel de rendez-vous. Ton rôle est de confirmer les rendez-vous, envoyer des rappels 24h et 1h avant, et gérer les reprogrammations. Sois poli et efficace.",
  collect: "Tu es un assistant de recouvrement de dettes professionnel et courtois. Ton rôle est de rappeler les paiements en retard, négocier des plans de paiement, et maintenir de bonnes relations avec les clients. Sois ferme mais respectueux.",
  broadcast: "Tu es un assistant de diffusion de messages. Réponds aux réactions et questions des clients suite aux messages de campagne. Sois accueillant et informatif.",
};

const AgentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    module: 'sell',
    system_prompt: defaultPrompts.sell,
    language: 'both',
    is_active: true,
  });

  const [testMessage, setTestMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch agent if editing
  useQuery({
    queryKey: ['agent', id],
    queryFn: () => agentService.getById(id),
    enabled: isEdit,
    onSuccess: (data) => {
      setFormData({
        name: data.name,
        module: data.module,
        system_prompt: data.system_prompt,
        language: data.language,
        is_active: data.is_active,
      });
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => agentService.create(currentWorkspace.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Agent créé avec succès!');
      navigate('/dashboard/agents');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => agentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['agents']);
      toast.success('Agent mis à jour!');
      navigate('/dashboard/agents');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la mise à jour');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleModuleChange = (value) => {
    setFormData({
      ...formData,
      module: value,
      system_prompt: defaultPrompts[value],
    });
  };

  const handleTestMessage = async () => {
    if (!testMessage.trim() || !id) return;

    setTestLoading(true);
    setChatHistory([...chatHistory, { role: 'user', content: testMessage }]);
    
    try {
      const response = await agentService.test(id, {
        test_message: testMessage,
        test_phone_number: '+221700000000',
      });
      
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: testMessage },
        { role: 'assistant', content: response.ai_response },
      ]);
      setTestMessage('');
    } catch (error) {
      toast.error('Erreur lors du test');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/agents')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold">
            {isEdit ? 'Modifier l\'agent' : 'Nouvel Agent'}
          </h1>
          <p className="text-text-secondary">
            {isEdit ? 'Éditez la configuration de votre agent' : 'Configurez votre agent IA'}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Nom de l'agent</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Assistant Commercial"
                required
              />
            </div>

            <div>
              <Label htmlFor="module">Module</Label>
              <Select value={formData.module} onValueChange={handleModuleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sell">💼 Sell (Ventes)</SelectItem>
                  <SelectItem value="remind">📅 Remind (Rappels)</SelectItem>
                  <SelectItem value="collect">💰 Collect (Recouvrement)</SelectItem>
                  <SelectItem value="broadcast">📢 Broadcast (Campagnes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Langue</Label>
              <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="both">Les deux (FR/EN)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="system_prompt">System Prompt</Label>
              <Textarea
                id="system_prompt"
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                rows={8}
                placeholder="Instructions pour l'IA..."
                required
              />
              <p className="text-xs text-text-muted mt-2">
                Décrivez le comportement et les instructions pour l'agent IA
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Agent actif</Label>
                <p className="text-xs text-text-muted">Activer pour recevoir les messages</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" disabled={createMutation.isLoading || updateMutation.isLoading}>
                {createMutation.isLoading || updateMutation.isLoading ? 'Enregistrement...' : 'Sauvegarder'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard/agents')}>
                Annuler
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Chat Preview */}
        <div className="bg-surface border border-border rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold mb-4">Prévisualisation du Chat</h3>
          
          {isEdit ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 bg-background rounded-xl p-4 mb-4 overflow-y-auto space-y-3 min-h-[400px]">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-text-muted py-8">
                    Envoyez un message de test pour voir comment l'agent répond
                  </div>
                ) : (
                  chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-surface-hover text-text-primary rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Message de test..."
                  onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                  disabled={testLoading}
                />
                <Button onClick={handleTestMessage} disabled={testLoading || !testMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <p className="mb-2">Sauvegardez d'abord l'agent</p>
                <p className="text-sm">pour tester la prévisualisation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentForm;

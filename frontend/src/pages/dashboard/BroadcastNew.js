import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { broadcastService, agentService, contactService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const BroadcastNew = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    agent_id: null,
    message_template: '',
    target_tags: [],
  });

  const { data: agents } = useQuery({
    queryKey: ['agents', currentWorkspace?.id],
    queryFn: () => agentService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const { data: contacts } = useQuery({
    queryKey: ['contacts', currentWorkspace?.id],
    queryFn: () => contactService.getAll(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const allTags = [...new Set(contacts?.flatMap(c => c.tags || []) || [])];
  const selectedContactsCount = contacts?.filter(c =>
    formData.target_tags.length === 0 || c.tags?.some(t => formData.target_tags.includes(t))
  ).length || 0;

  const createMutation = useMutation({
    mutationFn: (data) => broadcastService.create(currentWorkspace.id, data),
    onSuccess: async (broadcast) => {
      await broadcastService.send(broadcast.id);
      queryClient.invalidateQueries(['broadcasts']);
      toast.success('Campagne lancée!');
      navigate('/dashboard/broadcasts');
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/broadcasts')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">Nouvelle Campagne</h1>
            <p className="text-text-secondary">Créez une campagne de broadcast</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${
              s <= step ? 'bg-primary' : 'bg-surface-hover'
            }`} />
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Sélectionnez un agent</h3>
              <div className="grid grid-cols-2 gap-4">
                {agents?.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setFormData({ ...formData, agent_id: agent.id });
                      setStep(2);
                    }}
                    className={`p-6 border rounded-2xl text-left transition hover:border-primary ${
                      formData.agent_id === agent.id ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="font-bold mb-2">{agent.name}</div>
                    <div className="text-sm text-text-muted capitalize">{agent.module}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Rédigez votre message</h3>
              <Label>Message</Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                rows={8}
                placeholder="Bonjour {nom},\n\nNous avons une offre spéciale pour vous...\n\nÉquipe {entreprise}"
              />
              <p className="text-xs text-text-muted mt-2">
                Variables disponibles: {'{nom}'}, {'{entreprise}'}
              </p>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setStep(3)} disabled={!formData.message_template.trim()}>
                  Suivant
                </Button>
                <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Sélectionnez l'audience</h3>
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition">
                  <input
                    type="checkbox"
                    checked={formData.target_tags.length === 0}
                    onChange={() => setFormData({ ...formData, target_tags: [] })}
                  />
                  <span className="font-semibold">Tous les contacts</span>
                </label>
                {allTags.map(tag => (
                  <label key={tag} className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition">
                    <input
                      type="checkbox"
                      checked={formData.target_tags.includes(tag)}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          target_tags: e.target.checked
                            ? [...formData.target_tags, tag]
                            : formData.target_tags.filter(t => t !== tag)
                        });
                      }}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <div className="text-2xl font-black text-primary">{selectedContactsCount}</div>
                <div className="text-sm text-text-secondary">contacts sélectionnés</div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={createMutation.isLoading} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {createMutation.isLoading ? 'Envoi...' : 'Envoyer maintenant'}
                </Button>
                <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastNew;

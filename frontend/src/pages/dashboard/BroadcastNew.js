import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Clock, FlaskConical, Calendar } from 'lucide-react';
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
    ab_test_enabled: false,
    variant_b_template: '',
    scheduled_at: '',
    send_mode: 'now', // 'now' or 'scheduled'
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
    mutationFn: async (data) => {
      const payload = {
        agent_id: data.agent_id,
        message_template: data.message_template,
        target_tags: data.target_tags,
        ab_test_enabled: data.ab_test_enabled,
        variant_b_template: data.ab_test_enabled ? data.variant_b_template : null,
        scheduled_at: data.send_mode === 'scheduled' && data.scheduled_at ? data.scheduled_at : null,
      };
      const broadcast = await broadcastService.create(currentWorkspace.id, payload);
      if (data.send_mode === 'now') {
        await broadcastService.send(broadcast.id);
      }
      return broadcast;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['broadcasts']);
      if (variables.send_mode === 'scheduled') {
        toast.success('Campagne programmee !');
      } else {
        toast.success('Campagne lancee !');
      }
      navigate('/dashboard/broadcasts');
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Erreur lors de la creation'),
  });

  const handleSubmit = () => {
    createMutation.mutate(formData);
  };

  const steps = [
    { num: 1, label: 'Agent' },
    { num: 2, label: 'Message' },
    { num: 3, label: 'Audience' },
    { num: 4, label: 'Envoi' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/broadcasts')} data-testid="broadcast-back-btn">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">Nouvelle Campagne</h1>
            <p className="text-text-secondary">Creez une campagne de broadcast</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {steps.map(s => (
            <div key={s.num} className="flex-1">
              <div className={`h-1.5 rounded-full mb-1 transition ${s.num <= step ? 'bg-primary' : 'bg-surface-hover'}`} />
              <span className={`text-xs ${s.num <= step ? 'text-primary font-medium' : 'text-text-muted'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">

          {/* Step 1: Agent */}
          {step === 1 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Selectionnez un agent</h3>
              <div className="grid grid-cols-2 gap-4">
                {agents?.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => { setFormData({ ...formData, agent_id: agent.id }); setStep(2); }}
                    className={`p-6 border rounded-2xl text-left transition hover:border-primary ${formData.agent_id === agent.id ? 'border-primary bg-primary/5' : 'border-border'}`}
                    data-testid={`agent-select-${agent.id}`}
                  >
                    <div className="font-bold mb-2">{agent.name}</div>
                    <div className="text-sm text-text-muted capitalize">{agent.module}</div>
                  </button>
                ))}
                {(!agents || agents.length === 0) && (
                  <div className="col-span-2 text-center py-8 text-text-muted">
                    Aucun agent disponible.
                  </div>
                )}
              </div>
              <Button variant="outline" className="mt-4" onClick={() => { setFormData({ ...formData, agent_id: null }); setStep(2); }} data-testid="broadcast-continue-without-agent">
                Continuer sans agent
              </Button>
            </div>
          )}

          {/* Step 2: Message + A/B */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Redigez votre message</h3>

              <div>
                <Label>Message {formData.ab_test_enabled ? '(Variante A)' : ''}</Label>
                <Textarea
                  value={formData.message_template}
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                  rows={6}
                  placeholder="Bonjour {nom}, nous avons une offre speciale pour vous..."
                  data-testid="broadcast-message-input"
                />
                <p className="text-xs text-text-muted mt-1">Variables: {'{nom}'}, {'{entreprise}'}</p>
              </div>

              {/* A/B Toggle */}
              <div className="border border-border rounded-xl p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-5 rounded-full transition relative ${formData.ab_test_enabled ? 'bg-primary' : 'bg-surface-hover'}`}
                    onClick={() => setFormData({ ...formData, ab_test_enabled: !formData.ab_test_enabled })}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition ${formData.ab_test_enabled ? 'left-5.5 translate-x-1' : 'left-0.5'}`} />
                  </div>
                  <FlaskConical className="w-4 h-4 text-accent" />
                  <span className="font-medium text-sm">Activer le test A/B</span>
                  <span className="text-xs text-text-muted ml-auto">Comparez 2 versions de votre message</span>
                </label>
              </div>

              {formData.ab_test_enabled && (
                <div>
                  <Label>Message (Variante B)</Label>
                  <Textarea
                    value={formData.variant_b_template}
                    onChange={(e) => setFormData({ ...formData, variant_b_template: e.target.value })}
                    rows={6}
                    placeholder="Version alternative de votre message..."
                    data-testid="broadcast-variant-b-input"
                  />
                  <div className="mt-3 bg-accent/10 border border-accent/20 rounded-lg p-3 text-xs text-text-secondary">
                    <FlaskConical className="w-3 h-3 inline mr-1 text-accent" />
                    Les contacts seront repartis 50/50 entre les variantes A et B. Le gagnant sera determine par le taux de reponse.
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep(3)}
                  disabled={!formData.message_template.trim() || (formData.ab_test_enabled && !formData.variant_b_template.trim())}
                  data-testid="broadcast-step2-next"
                >
                  Suivant
                </Button>
                <Button variant="outline" onClick={() => setStep(1)}>Retour</Button>
              </div>
            </div>
          )}

          {/* Step 3: Audience */}
          {step === 3 && (
            <div>
              <h3 className="text-xl font-bold mb-6">Selectionnez l'audience</h3>
              <div className="space-y-3 mb-6">
                <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition">
                  <input type="checkbox" checked={formData.target_tags.length === 0} onChange={() => setFormData({ ...formData, target_tags: [] })} data-testid="broadcast-all-contacts" />
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
                          target_tags: e.target.checked ? [...formData.target_tags, tag] : formData.target_tags.filter(t => t !== tag)
                        });
                      }}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
                <div className="text-2xl font-black text-primary" data-testid="broadcast-contacts-count">{selectedContactsCount}</div>
                <div className="text-sm text-text-secondary">contacts selectionnes
                  {formData.ab_test_enabled && <span className="text-accent ml-1">({Math.floor(selectedContactsCount/2)} par variante)</span>}
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep(4)} data-testid="broadcast-step3-next">Suivant</Button>
                <Button variant="outline" onClick={() => setStep(2)}>Retour</Button>
              </div>
            </div>
          )}

          {/* Step 4: Send Mode */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Mode d'envoi</h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFormData({ ...formData, send_mode: 'now', scheduled_at: '' })}
                  className={`p-6 border rounded-2xl text-left transition ${formData.send_mode === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                  data-testid="broadcast-send-now"
                >
                  <Send className="w-6 h-6 text-primary mb-3" />
                  <div className="font-bold mb-1">Envoyer maintenant</div>
                  <p className="text-xs text-text-muted">Le broadcast est envoye immediatement</p>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, send_mode: 'scheduled' })}
                  className={`p-6 border rounded-2xl text-left transition ${formData.send_mode === 'scheduled' ? 'border-accent bg-accent/5' : 'border-border hover:border-accent/50'}`}
                  data-testid="broadcast-schedule"
                >
                  <Calendar className="w-6 h-6 text-accent mb-3" />
                  <div className="font-bold mb-1">Programmer</div>
                  <p className="text-xs text-text-muted">Choisissez une date et heure d'envoi</p>
                </button>
              </div>

              {formData.send_mode === 'scheduled' && (
                <div>
                  <Label>Date et heure d'envoi</Label>
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    min={new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition mt-2"
                    data-testid="broadcast-schedule-datetime"
                  />
                </div>
              )}

              {/* Summary */}
              <div className="bg-[#111118] border border-[#1E1E2E] rounded-xl p-5 space-y-3" data-testid="broadcast-summary">
                <h4 className="font-bold text-sm">Recapitulatif</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-text-muted">Contacts</div>
                  <div className="font-medium">{selectedContactsCount}</div>
                  <div className="text-text-muted">Test A/B</div>
                  <div className="font-medium">{formData.ab_test_enabled ? 'Oui (50/50)' : 'Non'}</div>
                  <div className="text-text-muted">Envoi</div>
                  <div className="font-medium">{formData.send_mode === 'now' ? 'Immediat' : formData.scheduled_at ? new Date(formData.scheduled_at).toLocaleString('fr-FR') : 'A programmer'}</div>
                </div>
                {formData.ab_test_enabled && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <div className="text-xs text-primary font-bold mb-1">Variante A</div>
                      <p className="text-xs text-text-muted line-clamp-2">{formData.message_template}</p>
                    </div>
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                      <div className="text-xs text-accent font-bold mb-1">Variante B</div>
                      <p className="text-xs text-text-muted line-clamp-2">{formData.variant_b_template}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || (formData.send_mode === 'scheduled' && !formData.scheduled_at)}
                  className="flex-1"
                  data-testid="broadcast-submit-btn"
                >
                  {formData.send_mode === 'scheduled' ? (
                    <><Clock className="w-4 h-4 mr-2" />{createMutation.isPending ? 'Programmation...' : 'Programmer l\'envoi'}</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" />{createMutation.isPending ? 'Envoi...' : 'Envoyer maintenant'}</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setStep(3)}>Retour</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BroadcastNew;

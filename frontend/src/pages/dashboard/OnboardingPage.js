import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, ArrowRight, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { workspaceService, agentService, contactService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  
  const [step, setStep] = useState(1);
  const [workspaceId, setWorkspaceId] = useState(null);
  const [agentId, setAgentId] = useState(null);
  
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
  });
  
  const [whatsappData, setWhatsappData] = useState({
    phone_number_id: '',
    access_token: '',
  });
  
  const [agentData, setAgentData] = useState({
    name: '',
    module: 'sell',
    system_prompt: "Tu es un assistant commercial professionnel. Aide les clients à découvrir nos produits.",
    language: 'both',
  });
  
  const [contactData, setContactData] = useState({
    phone_number: '',
    name: '',
    tags: ['test'],
  });

  // Step 1: Create workspace
  const createWorkspaceMutation = useMutation({
    mutationFn: (data) => workspaceService.create(data),
    onSuccess: async (workspace) => {
      setWorkspaceId(workspace.id);
      setCurrentWorkspace(workspace);
      const workspaces = await workspaceService.getAll();
      setWorkspaces(workspaces);
      toast.success('Workspace créé!');
      setStep(2);
    },
  });

  // Step 2: Connect WhatsApp (skip for now)
  const connectWhatsAppMutation = useMutation({
    mutationFn: (data) => workspaceService.connectWhatsApp(workspaceId, data),
    onSuccess: () => {
      toast.success('WhatsApp connecté!');
      setStep(3);
    },
  });

  // Step 3: Create agent
  const createAgentMutation = useMutation({
    mutationFn: (data) => agentService.create(workspaceId, data),
    onSuccess: (agent) => {
      setAgentId(agent.id);
      toast.success('Agent créé!');
      setStep(4);
    },
  });

  // Step 4: Add contact
  const addContactMutation = useMutation({
    mutationFn: (data) => contactService.create(workspaceId, data),
    onSuccess: () => {
      toast.success('Contact ajouté!');
      setStep(5);
    },
  });

  const handleStep1 = () => {
    createWorkspaceMutation.mutate(workspaceData);
  };

  const handleStep2Skip = () => {
    setStep(3);
  };

  const handleStep2 = () => {
    connectWhatsAppMutation.mutate({
      whatsapp_phone_number_id: whatsappData.phone_number_id,
      whatsapp_access_token: whatsappData.access_token,
    });
  };

  const handleStep3 = () => {
    createAgentMutation.mutate(agentData);
  };

  const handleStep4 = () => {
    addContactMutation.mutate(contactData);
  };

  const handleFinish = () => {
    queryClient.invalidateQueries();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex-1 mx-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'bg-primary' : 'bg-surface-hover'
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="text-center text-text-muted text-sm">
            Étape {step} sur 5
          </div>
        </div>

        {/* Steps */}
        <div className="bg-surface border border-border rounded-2xl p-12">
          {step === 1 && (
            <div className="text-center">
              <h1 className="text-4xl font-heading font-black mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Bienvenue sur WAZA! 👋
              </h1>
              <p className="text-text-secondary mb-8 text-lg">
                Créons votre workspace pour commencer
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-left">
                  <Label>Nom du workspace</Label>
                  <Input
                    value={workspaceData.name}
                    onChange={(e) => setWorkspaceData({ name: e.target.value })}
                    placeholder="Mon Entreprise"
                    autoFocus
                  />
                </div>
                <Button
                  onClick={handleStep1}
                  className="w-full"
                  disabled={!workspaceData.name.trim() || createWorkspaceMutation.isLoading}
                >
                  Continuer <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Connecter WhatsApp Business</h2>
              <p className="text-text-secondary mb-8">
                Connectez votre compte WhatsApp Business pour recevoir les messages
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-left">
                  <Label>Phone Number ID</Label>
                  <Input
                    value={whatsappData.phone_number_id}
                    onChange={(e) => setWhatsappData({ ...whatsappData, phone_number_id: e.target.value })}
                    placeholder="123456789012345"
                  />
                </div>
                <div className="text-left">
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    value={whatsappData.access_token}
                    onChange={(e) => setWhatsappData({ ...whatsappData, access_token: e.target.value })}
                    placeholder="EAAxxxxxxxxx..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleStep2} className="flex-1" disabled={connectWhatsAppMutation.isLoading}>
                    Connecter
                  </Button>
                  <Button variant="outline" onClick={handleStep2Skip}>
                    Passer pour l'instant
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Créer votre premier agent</h2>
              <p className="text-text-secondary mb-8">
                Configurez un agent IA pour gérer vos conversations
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-left">
                  <Label>Nom de l'agent</Label>
                  <Input
                    value={agentData.name}
                    onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                    placeholder="Assistant Commercial"
                  />
                </div>
                <div className="text-left">
                  <Label>Module</Label>
                  <Select
                    value={agentData.module}
                    onValueChange={(value) => setAgentData({ ...agentData, module: value })}
                  >
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
                <div className="text-left">
                  <Label>Langue</Label>
                  <Select
                    value={agentData.language}
                    onValueChange={(value) => setAgentData({ ...agentData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="both">Les deux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStep3}
                  className="w-full"
                  disabled={!agentData.name.trim() || createAgentMutation.isLoading}
                >
                  Créer l'agent <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Ajouter un contact de test</h2>
              <p className="text-text-secondary mb-8">
                Ajoutez votre numéro pour tester l'agent
              </p>
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-left">
                  <Label>Numéro (format international)</Label>
                  <Input
                    value={contactData.phone_number}
                    onChange={(e) => setContactData({ ...contactData, phone_number: e.target.value })}
                    placeholder="+221701234567"
                  />
                </div>
                <div className="text-left">
                  <Label>Nom (optionnel)</Label>
                  <Input
                    value={contactData.name}
                    onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                    placeholder="Test User"
                  />
                </div>
                <Button
                  onClick={handleStep4}
                  className="w-full"
                  disabled={!contactData.phone_number.trim() || addContactMutation.isLoading}
                >
                  Ajouter <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Tout est prêt! 🎉</h2>
              <p className="text-text-secondary mb-8 max-w-md mx-auto">
                Votre workspace WAZA est configuré. Vous pouvez maintenant gérer vos agents,
                contacts et conversations depuis le dashboard.
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                <div className="bg-background rounded-xl p-4">
                  <div className="text-2xl font-black text-primary">1</div>
                  <div className="text-xs text-text-muted">Workspace</div>
                </div>
                <div className="bg-background rounded-xl p-4">
                  <div className="text-2xl font-black text-primary">1</div>
                  <div className="text-xs text-text-muted">Agent</div>
                </div>
                <div className="bg-background rounded-xl p-4">
                  <div className="text-2xl font-black text-primary">1</div>
                  <div className="text-xs text-text-muted">Contact</div>
                </div>
              </div>
              <Button onClick={handleFinish} className="glow-green">
                <Rocket className="w-5 h-5 mr-2" />
                Lancer WAZA
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

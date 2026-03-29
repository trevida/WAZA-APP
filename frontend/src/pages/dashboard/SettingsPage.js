import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Smartphone, Users, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { workspaceService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const [workspaceData, setWorkspaceData] = useState({
    name: currentWorkspace?.name || '',
  });

  const [whatsappData, setWhatsappData] = useState({
    whatsapp_phone_number_id: currentWorkspace?.whatsapp_phone_number_id || '',
    whatsapp_access_token: currentWorkspace?.whatsapp_access_token || '',
  });

  const updateMutation = useMutation({
    mutationFn: (data) => workspaceService.update(currentWorkspace.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
      toast.success('Workspace mis à jour!');
    },
  });

  const whatsappMutation = useMutation({
    mutationFn: (data) => workspaceService.connectWhatsApp(currentWorkspace.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['workspaces']);
      toast.success('WhatsApp connecté!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => workspaceService.delete(currentWorkspace.id),
    onSuccess: () => {
      toast.success('Workspace supprimé');
      navigate('/dashboard');
    },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold mb-2">Paramètres</h1>
      <p className="text-text-secondary mb-8">Configuration de votre workspace et WhatsApp</p>

      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workspace">
            <Building2 className="w-4 h-4 mr-2" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <Smartphone className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="w-4 h-4 mr-2" />
            Équipe
          </TabsTrigger>
          <TabsTrigger value="danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold mb-6">Informations du Workspace</h3>
            <div className="space-y-4">
              <div>
                <Label>Nom du workspace</Label>
                <Input
                  value={workspaceData.name}
                  onChange={(e) => setWorkspaceData({ ...workspaceData, name: e.target.value })}
                />
              </div>
              <Button onClick={() => updateMutation.mutate(workspaceData)}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold mb-6">Connexion WhatsApp Business</h3>
            <div className="space-y-4 mb-6">
              <div>
                <Label>Phone Number ID</Label>
                <Input
                  value={whatsappData.whatsapp_phone_number_id}
                  onChange={(e) => setWhatsappData({ ...whatsappData, whatsapp_phone_number_id: e.target.value })}
                  placeholder="123456789012345"
                />
              </div>
              <div>
                <Label>Access Token</Label>
                <Input
                  type="password"
                  value={whatsappData.whatsapp_access_token}
                  onChange={(e) => setWhatsappData({ ...whatsappData, whatsapp_access_token: e.target.value })}
                  placeholder="EAAxxxxxxxxx..."
                />
              </div>
              <Button onClick={() => whatsappMutation.mutate(whatsappData)}>
                Connecter WhatsApp
              </Button>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">📘 Guide de configuration</p>
              <ol className="text-sm text-text-secondary space-y-1 list-decimal list-inside">
                <li>Accédez à Meta Business Suite</li>
                <li>Créez une app WhatsApp Business</li>
                <li>Copiez le Phone Number ID et l'Access Token</li>
                <li>Collez les credentials ci-dessus</li>
              </ol>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <div className="bg-surface border border-border rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold mb-4">Équipe</h3>
            <p className="text-text-muted mb-6">Disponible pour les plans Pro et Business</p>
            <Button variant="outline" disabled>Inviter un membre</Button>
          </div>
        </TabsContent>

        <TabsContent value="danger">
          <div className="bg-surface border border-destructive rounded-2xl p-8 max-w-2xl">
            <h3 className="text-xl font-bold mb-2 text-destructive">Supprimer le workspace</h3>
            <p className="text-text-secondary mb-6">
              Cette action est irréversible. Toutes vos données seront perdues.
            </p>
            <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
              Supprimer le workspace
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le workspace?</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Tapez le nom du workspace pour confirmer:
              <strong className="block mt-2">{currentWorkspace?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Nom du workspace"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteConfirm !== currentWorkspace?.name}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;

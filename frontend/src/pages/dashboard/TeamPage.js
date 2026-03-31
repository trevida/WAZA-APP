import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Crown, User, Mail, Trash2, ChevronDown, Check, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { teamService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const TeamPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [editingRole, setEditingRole] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['team-members', currentWorkspace?.id],
    queryFn: () => teamService.getMembers(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const { data: invitationsData } = useQuery({
    queryKey: ['my-invitations'],
    queryFn: teamService.getMyInvitations,
  });

  const inviteMutation = useMutation({
    mutationFn: (formData) => teamService.invite(currentWorkspace.id, formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['team-members']);
      toast.success(res.message);
      setShowInvite(false);
      setInviteForm({ email: '', role: 'member' });
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Erreur'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }) => teamService.updateRole(currentWorkspace.id, memberId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
      toast.success('Role mis a jour');
      setEditingRole(null);
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Erreur'),
  });

  const removeMutation = useMutation({
    mutationFn: (memberId) => teamService.remove(currentWorkspace.id, memberId),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['team-members']);
      toast.success(res.message);
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Erreur'),
  });

  const acceptMutation = useMutation({
    mutationFn: (token) => teamService.acceptInvitation(token),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['my-invitations', 'workspaces']);
      toast.success(res.message);
    },
    onError: (err) => toast.error(err?.response?.data?.detail || 'Erreur'),
  });

  const members = data?.members || [];
  const invitations = invitationsData?.invitations || [];

  const roleConfig = {
    owner: { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Proprietaire' },
    admin: { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Admin' },
    member: { icon: User, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Membre' },
  };

  const statusConfig = {
    active: { color: 'text-primary', bg: 'bg-primary/10', label: 'Actif' },
    pending: { color: 'text-accent', bg: 'bg-accent/10', label: 'Invite' },
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2" data-testid="team-title">Equipe</h1>
          <p className="text-text-secondary">Gerez les membres de votre workspace</p>
        </div>
        <Button onClick={() => setShowInvite(true)} data-testid="team-invite-btn">
          <UserPlus className="w-4 h-4 mr-2" /> Inviter un membre
        </Button>
      </div>

      {/* Pending Invitations for current user */}
      {invitations.length > 0 && (
        <div className="mb-6 space-y-3" data-testid="pending-invitations">
          <h3 className="text-sm font-bold text-accent flex items-center gap-2">
            <Mail className="w-4 h-4" /> Invitations en attente
          </h3>
          {invitations.map((inv) => (
            <div key={inv.id} className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{inv.workspace_name}</span>
                <span className="text-text-muted ml-2 text-sm">par {inv.invited_by_name}</span>
                <Badge className="ml-2" variant="outline">{inv.role}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => acceptMutation.mutate(inv.invite_token)} disabled={acceptMutation.isPending} data-testid={`accept-invite-${inv.id}`}>
                  <Check className="w-3 h-3 mr-1" /> Accepter
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowInvite(false)}>
          <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()} data-testid="invite-modal">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Inviter un membre</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowInvite(false)}><X className="w-4 h-4" /></Button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(inviteForm); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition"
                  placeholder="collegue@email.com"
                  data-testid="invite-email-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'member', label: 'Membre', desc: 'Voir et agir dans le workspace', icon: User },
                    { value: 'admin', label: 'Admin', desc: 'Gerer les membres et parametres', icon: Shield },
                  ].map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setInviteForm({ ...inviteForm, role: r.value })}
                      className={`p-4 border rounded-xl text-left transition ${inviteForm.role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      data-testid={`invite-role-${r.value}`}
                    >
                      <r.icon className={`w-5 h-5 mb-2 ${inviteForm.role === r.value ? 'text-primary' : 'text-text-muted'}`} />
                      <div className="font-medium text-sm">{r.label}</div>
                      <div className="text-xs text-text-muted">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={inviteMutation.isPending} data-testid="invite-submit-btn">
                {inviteMutation.isPending ? 'Envoi...' : 'Envoyer l\'invitation'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Members List */}
      {isLoading ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-text-muted">Chargement...</div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden" data-testid="team-members-list">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium text-text-muted">{members.length} membre{members.length > 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y divide-border">
            {members.map((member) => {
              const rc = roleConfig[member.role] || roleConfig.member;
              const sc = statusConfig[member.status] || statusConfig.active;
              const RoleIcon = rc.icon;
              return (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-hover/50 transition" data-testid={`member-row-${member.id}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${rc.bg} flex items-center justify-center`}>
                      <RoleIcon className={`w-5 h-5 ${rc.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.user_name || member.email}</span>
                        {member.status === 'pending' && (
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                            <Clock className="w-2.5 h-2.5" /> {sc.label}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-muted">{member.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Role Badge / Dropdown */}
                    {member.role === 'owner' ? (
                      <Badge className={`${rc.bg} ${rc.color} border-0`}>{rc.label}</Badge>
                    ) : editingRole === member.id ? (
                      <div className="flex gap-1">
                        {['admin', 'member'].map(r => (
                          <button
                            key={r}
                            onClick={() => updateRoleMutation.mutate({ memberId: member.id, role: r })}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${member.role === r ? 'bg-primary/10 text-primary' : 'bg-surface-hover text-text-muted hover:text-white'}`}
                            data-testid={`set-role-${r}-${member.id}`}
                          >
                            {r === 'admin' ? 'Admin' : 'Membre'}
                          </button>
                        ))}
                        <Button variant="ghost" size="sm" onClick={() => setEditingRole(null)}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRole(member.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium ${rc.bg} ${rc.color} hover:opacity-80`}
                        data-testid={`edit-role-${member.id}`}
                      >
                        {rc.label} <ChevronDown className="w-3 h-3" />
                      </button>
                    )}

                    {/* Remove */}
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { if (window.confirm(`Retirer ${member.email} ?`)) removeMutation.mutate(member.id); }}
                        data-testid={`remove-member-${member.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;

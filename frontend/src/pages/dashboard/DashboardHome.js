import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MessageCircle, Users, TrendingUp, Bot } from 'lucide-react';
import { analyticsService, workspaceService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';
import useAuthStore from '@/store/authStore';

const DashboardHome = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const setWorkspaces = useWorkspaceStore((state) => state.setWorkspaces);
  const setCurrentWorkspace = useWorkspaceStore((state) => state.setCurrentWorkspace);
  const user = useAuthStore((state) => state.user);

  // Fetch workspaces
  const { data: workspaces } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceService.getAll,
    onSuccess: (data) => {
      setWorkspaces(data);
      if (data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]);
      }
    },
  });

  // Fetch analytics
  const { data: overview } = useQuery({
    queryKey: ['analytics-overview', currentWorkspace?.id],
    queryFn: () => analyticsService.getOverview(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const stats = [
    {
      name: 'Messages ce mois',
      value: overview?.messages_this_month || 0,
      icon: MessageCircle,
      color: 'text-primary',
    },
    {
      name: 'Conversations actives',
      value: overview?.active_conversations || 0,
      icon: Users,
      color: 'text-accent',
    },
    {
      name: 'Total conversations',
      value: overview?.total_conversations || 0,
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  // Mock chart data
  const chartData = [
    { date: 'Lun', messages: 45 },
    { date: 'Mar', messages: 52 },
    { date: 'Mer', messages: 48 },
    { date: 'Jeu', messages: 61 },
    { date: 'Ven', messages: 55 },
    { date: 'Sam', messages: 38 },
    { date: 'Dim', messages: 42 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Bienvenue, {user?.full_name} 👋</h1>
        <p className="text-text-secondary">Voici un aperçu de votre activité</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-surface border border-border rounded-2xl p-6 hover-lift"
            data-testid={`stat-${stat.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-text-muted text-sm">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Usage Progress */}
      {overview && (
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Utilisation du plan</h3>
            <span className="text-sm text-text-secondary">
              {overview.messages_this_month} / {overview.message_limit === -1 ? '∞' : overview.message_limit} messages
            </span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(overview.usage_percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-6">Messages des 7 derniers jours</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#B0B0C0" />
            <YAxis stroke="#B0B0C0" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A2E',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="messages"
              stroke="#00C853"
              strokeWidth={2}
              dot={{ fill: '#00C853', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardHome;

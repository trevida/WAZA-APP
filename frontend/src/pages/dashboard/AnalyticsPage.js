import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MessageCircle, Users, TrendingUp, Target } from 'lucide-react';
import { analyticsService } from '@/services';
import useWorkspaceStore from '@/store/workspaceStore';

const AnalyticsPage = () => {
  const currentWorkspace = useWorkspaceStore((state) => state.currentWorkspace);
  const [period, setPeriod] = useState('30');

  const { data: overview } = useQuery({
    queryKey: ['analytics-overview', currentWorkspace?.id],
    queryFn: () => analyticsService.getOverview(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  const { data: conversions } = useQuery({
    queryKey: ['analytics-conversions', currentWorkspace?.id],
    queryFn: () => analyticsService.getConversions(currentWorkspace.id),
    enabled: !!currentWorkspace,
  });

  // Mock data
  const messagesData = [
    { date: 'Lun', messages: 45 },
    { date: 'Mar', messages: 52 },
    { date: 'Mer', messages: 48 },
    { date: 'Jeu', messages: 61 },
    { date: 'Ven', messages: 55 },
    { date: 'Sam', messages: 38 },
    { date: 'Dim', messages: 42 },
  ];

  const moduleData = [
    { module: 'Sell', count: 145 },
    { module: 'Remind', count: 89 },
    { module: 'Collect', count: 67 },
    { module: 'Broadcast', count: 112 },
  ];

  const languageData = [
    { name: 'Français', value: 65, color: '#00C853' },
    { name: 'English', value: 20, color: '#FFD600' },
    { name: 'Les deux', value: 15, color: '#1A1A2E' },
  ];

  const kpis = [
    { name: 'Messages', value: overview?.total_messages || 0, icon: MessageCircle },
    { name: 'Conversations', value: overview?.total_conversations || 0, icon: Users },
    { name: 'Taux réponse', value: '87%', icon: TrendingUp },
    { name: 'Conversions', value: conversions?.qualified_leads || 0, icon: Target },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Analytics</h1>
          <p className="text-text-secondary">Statistiques détaillées de vos agents</p>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg transition ${
                period === p ? 'bg-primary text-primary-foreground' : 'bg-surface hover:bg-surface-hover'
              }`}
            >
              {p}j
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-surface border border-border rounded-2xl p-6">
            <kpi.icon className="w-6 h-6 text-primary mb-3" />
            <div className="text-3xl font-black mb-1">{kpi.value}</div>
            <div className="text-text-muted text-sm">{kpi.name}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Messages par jour</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={messagesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="#B0B0C0" />
              <YAxis stroke="#B0B0C0" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Line type="monotone" dataKey="messages" stroke="#00C853" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Conversations par module</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={moduleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="module" stroke="#B0B0C0" />
              <YAxis stroke="#B0B0C0" />
              <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="count" fill="#00C853" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Répartition langues</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={languageData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {languageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1A1A2E', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Conversion Stats */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4">Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Leads qualifiés</span>
                <span className="font-bold">{conversions?.qualified_leads || 0}</span>
              </div>
              <div className="w-full bg-surface-hover rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: `${conversions?.conversion_rate || 0}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">Taux de conversion</span>
                <span className="font-bold text-primary">{conversions?.conversion_rate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

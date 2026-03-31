import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  suspendUser: async (userId, suspend) => {
    const response = await api.put(`/admin/users/${userId}/suspend`, { suspend });
    return response.data;
  },

  changeUserPlan: async (userId, plan) => {
    const response = await api.put(`/admin/users/${userId}/plan`, { plan });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getRevenues: async () => {
    const response = await api.get('/admin/revenues');
    return response.data;
  },

  getWorkspaces: async (params = {}) => {
    const response = await api.get('/admin/workspaces', { params });
    return response.data;
  },

  getMessages: async () => {
    const response = await api.get('/admin/messages');
    return response.data;
  },

  getRecentSignups: async (limit = 10) => {
    const response = await api.get('/admin/recent-signups', { params: { limit } });
    return response.data;
  },

  getTopWorkspaces: async (limit = 5) => {
    const response = await api.get('/admin/top-workspaces', { params: { limit } });
    return response.data;
  },

  getPaymentConfig: async () => {
    const response = await api.get('/admin/payment-config');
    return response.data;
  },

  updatePaymentConfig: async (data) => {
    const response = await api.put('/admin/payment-config', data);
    return response.data;
  },

  getDemoStats: async () => {
    const response = await api.get('/admin/demo-stats');
    return response.data;
  },

  getAdvancedAnalytics: async () => {
    const response = await api.get('/admin/analytics/advanced');
    return response.data;
  },

  getAuditLogs: async (page = 1, limit = 50, actionFilter = '') => {
    const params = { page, limit };
    if (actionFilter) params.action_filter = actionFilter;
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  exportUsersPdf: async () => {
    const response = await api.get('/admin/export/users-pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'waza_users_report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  exportRevenuesPdf: async () => {
    const response = await api.get('/admin/export/revenues-pdf', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'waza_revenues_report.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

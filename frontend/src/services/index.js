import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken });
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  },

  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },
};

export const workspaceService = {
  getAll: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/workspaces', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/workspaces/${id}`);
  },

  connectWhatsApp: async (id, credentials) => {
    const response = await api.post(`/workspaces/${id}/connect-whatsapp`, credentials);
    return response.data;
  },
};

export const agentService = {
  getAll: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/agents`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/agents/${id}`);
    return response.data;
  },

  create: async (workspaceId, data) => {
    const response = await api.post(`/workspaces/${workspaceId}/agents`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/agents/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/agents/${id}`);
  },

  test: async (id, testData) => {
    const response = await api.post(`/agents/${id}/test`, testData);
    return response.data;
  },
};

export const contactService = {
  getAll: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/contacts`);
    return response.data;
  },

  create: async (workspaceId, data) => {
    const response = await api.post(`/workspaces/${workspaceId}/contacts`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/contacts/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/contacts/${id}`);
  },

  importBulk: async (workspaceId, contacts) => {
    const response = await api.post(`/workspaces/${workspaceId}/contacts/import`, { contacts });
    return response.data;
  },
};

export const conversationService = {
  getAll: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/conversations`);
    return response.data;
  },

  getMessages: async (conversationId) => {
    const response = await api.get(`/conversations/${conversationId}/messages`);
    return response.data;
  },

  close: async (conversationId) => {
    const response = await api.post(`/conversations/${conversationId}/close`);
    return response.data;
  },
};

export const broadcastService = {
  getAll: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/broadcasts`);
    return response.data;
  },

  create: async (workspaceId, data) => {
    const response = await api.post(`/workspaces/${workspaceId}/broadcasts`, data);
    return response.data;
  },

  send: async (id) => {
    const response = await api.post(`/broadcasts/${id}/send`);
    return response.data;
  },

  getStats: async (id) => {
    const response = await api.get(`/broadcasts/${id}/stats`);
    return response.data;
  },
};

export const analyticsService = {
  getOverview: async (workspaceId) => {
    const response = await api.get(`/analytics/workspaces/${workspaceId}/overview`);
    return response.data;
  },

  getMessages: async (workspaceId) => {
    const response = await api.get(`/analytics/workspaces/${workspaceId}/messages`);
    return response.data;
  },

  getConversions: async (workspaceId) => {
    const response = await api.get(`/analytics/workspaces/${workspaceId}/conversions`);
    return response.data;
  },
};

export const billingService = {
  getPlans: async () => {
    const response = await api.get('/billing/plans');
    return response.data;
  },

  subscribe: async (data) => {
    const response = await api.post('/billing/subscribe', data);
    return response.data;
  },

  getSubscription: async () => {
    const response = await api.get('/billing/subscription');
    return response.data;
  },

  cancel: async () => {
    const response = await api.post('/billing/cancel');
    return response.data;
  },

  checkPaymentStatus: async (sessionId) => {
    const response = await api.get(`/billing/checkout/status/${sessionId}`);
    return response.data;
  },
};

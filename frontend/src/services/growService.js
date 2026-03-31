import api from './api';

export const growService = {
  // Feature Flags
  getFeatureFlags: async () => {
    const response = await api.get('/grow/feature-flags');
    return response.data;
  },

  // Waitlist
  joinWaitlist: async (data) => {
    const response = await api.post('/grow/waitlist', data);
    return response.data;
  },
  getWaitlistCount: async () => {
    const response = await api.get('/grow/waitlist/count');
    return response.data;
  },

  // Plans
  getPlans: async () => {
    const response = await api.get('/grow/plans');
    return response.data;
  },

  // Subscription
  getSubscription: async () => {
    const response = await api.get('/grow/subscription');
    return response.data;
  },
  subscribe: async (plan, paymentProvider = 'stripe') => {
    const response = await api.post('/grow/subscribe', { plan, payment_provider: paymentProvider });
    return response.data;
  },
  cancelSubscription: async () => {
    const response = await api.post('/grow/cancel');
    return response.data;
  },

  // Facebook Account
  getFbAccount: async () => {
    const response = await api.get('/grow/fb-account');
    return response.data;
  },
  connectFb: async (data) => {
    const response = await api.post('/grow/fb-account/connect', data);
    return response.data;
  },
  disconnectFb: async () => {
    const response = await api.post('/grow/fb-account/disconnect');
    return response.data;
  },

  // Campaigns
  getCampaigns: async () => {
    const response = await api.get('/grow/campaigns');
    return response.data;
  },
  getCampaign: async (id) => {
    const response = await api.get(`/grow/campaigns/${id}`);
    return response.data;
  },
  createCampaign: async (data) => {
    const response = await api.post('/grow/campaigns', data);
    return response.data;
  },
  updateCampaignStatus: async (id, status) => {
    const response = await api.put(`/grow/campaigns/${id}/status?status=${status}`);
    return response.data;
  },

  // AI Creative
  generateCreative: async (data) => {
    const response = await api.post('/grow/generate-creative', data);
    return response.data;
  },

  // Overview
  getOverview: async () => {
    const response = await api.get('/grow/overview');
    return response.data;
  },
};

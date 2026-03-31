import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/services';
import useAuthStore from '@/store/authStore';
import api from '@/services/api';
import LanguageToggle from '@/components/LanguageToggle';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUnverifiedEmail(null);
    try {
      const response = await authService.login(formData);
      setAuth(response.user, response.access_token, response.refresh_token);
      if (!response.user.is_verified) setUnverifiedEmail(response.user.email);
      toast.success(t('auth.login_button') + ' ✓');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success(t('auth.unverified_resend') + ' ✓');
    } catch { toast.error(t('common.error')); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Link to="/" className="inline-flex items-center space-x-2">
              <MessageCircle className="w-10 h-10 text-primary" />
              <span className="text-3xl font-heading font-black">WAZA</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('auth.login_title')}</h1>
          <p className="text-text-secondary">{t('auth.login_subtitle')}</p>
          <div className="mt-3 flex justify-center"><LanguageToggle /></div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {unverifiedEmail && (
            <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-start gap-3" data-testid="unverified-banner">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-yellow-400 font-medium">{t('auth.unverified_title')}</p>
                <p className="text-text-muted mt-1">
                  <button onClick={handleResendVerification} disabled={resending} className="text-primary hover:underline">
                    {resending ? t('auth.unverified_sending') : t('auth.unverified_resend')}
                  </button>
                </p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">{t('auth.email_label')}</Label>
              <Input id="email" type="email" placeholder="ton@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required data-testid="login-email-input" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="password">{t('auth.password_label')}</Label>
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">{t('auth.password_forgot')}</Link>
              </div>
              <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required data-testid="login-password-input" />
            </div>
            <Button type="submit" className="w-full" disabled={loading} data-testid="login-submit-button">
              {loading ? t('auth.login_loading') : t('auth.login_button')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-text-secondary">
            {t('auth.login_no_account')}{' '}
            <Link to="/register" className="text-primary hover:underline font-semibold">{t('auth.login_signup')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/services';
import useAuthStore from '@/store/authStore';
import LanguageToggle from '@/components/LanguageToggle';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '', full_name: '', company_name: '', phone: '', country: 'CM' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.register(formData);
      setAuth(response.user, response.access_token, response.refresh_token);
      setRegisteredEmail(formData.email);
      setRegistered(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <MessageCircle className="w-10 h-10 text-primary" />
            <span className="text-3xl font-heading font-black">WAZA</span>
          </Link>
          <div className="bg-surface border border-border rounded-2xl p-8 space-y-4" data-testid="register-success">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"><Mail className="w-8 h-8 text-primary" /></div>
            <h2 className="text-2xl font-bold">{t('auth.register_success_title')}</h2>
            <p className="text-text-secondary">{t('auth.register_success_text')} <strong className="text-text-primary">{registeredEmail}</strong>.</p>
            <Button onClick={() => navigate('/dashboard/onboarding')} className="w-full" data-testid="register-continue-btn">{t('auth.register_continue')}</Button>
            <p className="text-xs text-text-muted">{t('auth.register_verify_later')}</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold mb-2">{t('auth.register_title')}</h1>
          <p className="text-text-secondary">{t('auth.register_subtitle')}</p>
          <div className="mt-3 flex justify-center"><LanguageToggle /></div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="full_name">{t('auth.name_label')}</Label>
              <Input id="full_name" placeholder="Jean Dupont" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required data-testid="register-name-input" />
            </div>
            <div>
              <Label htmlFor="email">{t('auth.email_label')}</Label>
              <Input id="email" type="email" placeholder="ton@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required data-testid="register-email-input" />
            </div>
            <div>
              <Label htmlFor="password">{t('auth.password_label')}</Label>
              <Input id="password" type="password" placeholder={t('auth.password_min')} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} data-testid="register-password-input" />
            </div>
            <div>
              <Label htmlFor="company_name">{t('auth.company_label')}</Label>
              <Input id="company_name" placeholder="Mon Entreprise" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="phone">{t('auth.phone_label')}</Label>
              <Input id="phone" type="tel" placeholder="+237 6 99 12 34 56" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <Button type="submit" className="w-full" disabled={loading} data-testid="register-submit-button">
              {loading ? t('auth.register_loading') : t('auth.register_button')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-text-secondary">
            {t('auth.register_has_account')}{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">{t('auth.register_signin')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { authService } from '@/services';
import LanguageToggle from '@/components/LanguageToggle';

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
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
          <h1 className="text-3xl font-bold mb-2">{t('auth.forgot_title')}</h1>
          <p className="text-text-secondary">{t('auth.forgot_subtitle')}</p>
          <div className="mt-3 flex justify-center"><LanguageToggle /></div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">{t('auth.email_label')}</Label>
                <Input id="email" type="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('auth.forgot_loading') : t('auth.forgot_button')}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto"><MessageCircle className="w-8 h-8 text-primary" /></div>
              <p className="text-text-secondary">{t('auth.forgot_success')} <strong className="text-text-primary">{email}</strong>. {t('auth.forgot_check')}</p>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-primary hover:underline"><ArrowLeft className="w-4 h-4 mr-1" />{t('auth.forgot_back')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const { t } = useTranslation();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2 mb-8">
          <MessageCircle className="w-10 h-10 text-primary" />
          <span className="text-3xl font-heading font-black">WAZA</span>
        </Link>

        <div className="bg-surface border border-border rounded-2xl p-8" data-testid="verify-email-page">
          {status === 'loading' && (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <p className="text-text-secondary">{t('auth.verify_loading')}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-green-500" /></div>
              <h2 className="text-2xl font-bold">{t('auth.verify_success_title')}</h2>
              <p className="text-text-secondary">{t('auth.verify_success_text')}</p>
              <Link to="/login"><Button className="w-full mt-4" data-testid="verify-go-login">{t('auth.login_button')}</Button></Link>
            </div>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto"><XCircle className="w-8 h-8 text-red-500" /></div>
              <h2 className="text-2xl font-bold">{t('auth.verify_error_title')}</h2>
              <p className="text-text-secondary">{t('auth.verify_error_text')}</p>
              <Link to="/login"><Button variant="outline" className="w-full mt-4" data-testid="verify-go-login-error">{t('auth.forgot_back')}</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

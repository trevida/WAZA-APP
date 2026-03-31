import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';

const TermsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <nav className="glass-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MessageCircle className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-black">WAZA</span>
            </Link>
            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <Link to="/login"><Button variant="ghost">{t('nav.login')}</Button></Link>
              <Link to="/register"><Button>{t('nav.register')}</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="terms-page">
        <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />{t('common.back_home')}
        </Link>

        <h1 className="text-4xl sm:text-5xl font-black mb-8 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          {t('terms.title')}
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          <p className="text-lg">{t('terms.last_updated')}</p>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s1_title')}</h2>
            <p>{t('terms.s1_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s2_title')}</h2>
            <p>{t('terms.s2_intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>{t('terms.s2_i1')}</li>
              <li>{t('terms.s2_i2')}</li>
              <li>{t('terms.s2_i3')}</li>
              <li>{t('terms.s2_i4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s3_title')}</h2>
            <p>{t('terms.s3_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s4_title')}</h2>
            <p>{t('terms.s4_intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>{t('terms.s4_i1')}</li>
              <li>{t('terms.s4_i2')}</li>
              <li>{t('terms.s4_i3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s5_title')}</h2>
            <p>{t('terms.s5_intro')}</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>{t('terms.s5_i1')}</li>
              <li>{t('terms.s5_i2')}</li>
              <li>{t('terms.s5_i3')}</li>
              <li>{t('terms.s5_i4')}</li>
              <li>{t('terms.s5_i5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s6_title')}</h2>
            <p>{t('terms.s6_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s7_title')}</h2>
            <p>{t('terms.s7_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s8_title')}</h2>
            <p>{t('terms.s8_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s9_title')}</h2>
            <p>{t('terms.s9_text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">{t('terms.s10_title')}</h2>
            <p>
              {t('terms.s10_text')}
              <br />Email : <a href="mailto:legal@waza.africa" className="text-primary hover:underline">legal@waza.africa</a>
              <br />WAZA — Massudom Silicon Valley, Bandjoun, Cameroun
            </p>
          </section>
        </div>
      </div>

      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;

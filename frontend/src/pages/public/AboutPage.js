import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ArrowLeft, Target, Users, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageToggle from '@/components/LanguageToggle';

const AboutPage = () => {
  const { t } = useTranslation();

  const values = [
    { icon: <Target className="w-6 h-6 text-primary" />, title: t('about.value_local_title'), description: t('about.value_local_desc') },
    { icon: <Zap className="w-6 h-6 text-primary" />, title: t('about.value_innovation_title'), description: t('about.value_innovation_desc') },
    { icon: <Users className="w-6 h-6 text-primary" />, title: t('about.value_accessibility_title'), description: t('about.value_accessibility_desc') },
    { icon: <Globe className="w-6 h-6 text-primary" />, title: t('about.value_vision_title'), description: t('about.value_vision_desc') },
  ];

  const stats = [
    { value: '15+', label: t('about.stat_countries') },
    { value: '500+', label: t('about.stat_businesses') },
    { value: '2M+', label: t('about.stat_messages') },
    { value: '24/7', label: t('about.stat_availability') },
  ];

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

      <div data-testid="about-page">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />{t('common.back_home')}
          </Link>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
            {t('about.title')}
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl">{t('about.intro')}</p>
        </div>

        <div className="bg-surface/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t('about.mission_title')}</h2>
            <p className="text-lg text-text-secondary leading-relaxed">{t('about.mission_text')}</p>
          </div>
        </div>

        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-text-secondary text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-surface/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10">{t('about.values_title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <div key={i} className="bg-surface border border-border rounded-2xl p-6 hover-lift transition-all">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">{value.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-text-secondary text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">{t('about.team_title')}</h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">{t('about.team_text')}</p>
            <Link to="/contact"><Button className="glow-green" data-testid="about-contact-button">{t('about.team_cta')}</Button></Link>
          </div>
        </div>

        <div className="bg-surface/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('about.cta_title')}</h2>
            <p className="text-text-secondary mb-8">{t('about.cta_subtitle')}</p>
            <Link to="/register"><Button size="lg" className="glow-green" data-testid="about-cta-button">{t('about.cta_button')}</Button></Link>
          </div>
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

export default AboutPage;

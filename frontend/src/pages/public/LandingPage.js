import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Bot, Calendar, DollarSign, Megaphone, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoModal from '@/components/DemoModal';
import LanguageToggle from '@/components/LanguageToggle';

const LandingPage = () => {
  const [showDemo, setShowDemo] = useState(false);
  const { t } = useTranslation();

  const features = [
    { icon: <Bot className="w-8 h-8 text-primary" />, title: t('landing.feature_sell'), description: t('landing.feature_sell_desc') },
    { icon: <Calendar className="w-8 h-8 text-primary" />, title: t('landing.feature_remind'), description: t('landing.feature_remind_desc') },
    { icon: <DollarSign className="w-8 h-8 text-primary" />, title: t('landing.feature_collect'), description: t('landing.feature_collect_desc') },
    { icon: <Megaphone className="w-8 h-8 text-primary" />, title: t('landing.feature_broadcast'), description: t('landing.feature_broadcast_desc') },
  ];

  const plans = [
    { name: 'Free', price: 0, features: [`100 ${t('plans.messages_month')}`, `1 ${t('plans.agent')}`, `1 ${t('plans.workspace')}`, t('plans.community_support')], cta: t('landing.plan_free_cta'), highlighted: false },
    { name: 'Starter', price: 19900, features: [`1,500 ${t('plans.messages_month')}`, `1 ${t('plans.agent')}`, `1 ${t('plans.workspace')}`, t('plans.email_support')], cta: t('landing.plan_starter_cta'), highlighted: false },
    { name: 'Pro', price: 49900, features: [`8,000 ${t('plans.messages_month')}`, `5 ${t('plans.agents')}`, `3 ${t('plans.workspaces')}`, t('plans.priority_support'), t('plans.advanced_analytics')], cta: t('landing.plan_pro_cta'), highlighted: true },
    { name: 'Business', price: 99000, features: [t('plans.unlimited_messages'), t('plans.unlimited_agents'), t('plans.unlimited_workspaces'), t('plans.dedicated_support'), t('plans.white_label')], cta: t('landing.plan_business_cta'), highlighted: false },
  ];

  const testimonials = [
    { name: 'Amadou Diallo', role: 'CEO, SenShop', image: 'https://images.unsplash.com/photo-1738750908048-14200459c3c9?crop=entropy&cs=srgb&fm=jpg&q=85&w=200', quote: 'WAZA a transformé notre service client. Nos ventes ont augmenté de 35% en 2 mois.' },
    { name: 'Fatou Sall', role: 'Directrice Marketing, AfriBank', image: 'https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=srgb&fm=jpg&q=85&w=200', quote: "L'automatisation des rappels nous a fait économiser 20h/semaine. Incroyable!" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ backgroundImage: 'url(https://images.pexels.com/photos/30766684/pexels-photo-30766684.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-gradient-radial from-background/60 to-background"></div>
        </div>

        {/* Navbar */}
        <nav className="relative z-10 glass-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-8 h-8 text-primary" />
                <span className="text-2xl font-heading font-black">WAZA</span>
              </div>
              <div className="hidden md:flex items-center space-x-6">
                <Link to="/about" className="text-sm text-text-secondary hover:text-primary transition" data-testid="nav-about-link">{t('nav.about')}</Link>
                <Link to="/contact" className="text-sm text-text-secondary hover:text-primary transition" data-testid="nav-contact-link">{t('nav.contact')}</Link>
              </div>
              <div className="flex items-center space-x-3">
                <LanguageToggle />
                <Link to="/login"><Button variant="ghost" data-testid="nav-login-button">{t('nav.login')}</Button></Link>
                <Link to="/register"><Button data-testid="nav-register-button">{t('nav.register')}</Button></Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent">
              {t('landing.hero_title_1')}<br />{t('landing.hero_title_2')}
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">{t('landing.hero_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 glow-green" data-testid="hero-cta-button">{t('landing.cta_free')} <ArrowRight className="ml-2 w-5 h-5" /></Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="hero-demo-button" onClick={() => setShowDemo(true)}>{t('landing.cta_demo')}</Button>
            </div>
          </div>
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center"><div className="text-4xl font-black text-primary">500+</div><div className="text-text-secondary">{t('landing.stat_businesses')}</div></div>
            <div className="text-center"><div className="text-4xl font-black text-primary">2M+</div><div className="text-text-secondary">{t('landing.stat_messages')}</div></div>
            <div className="text-center"><div className="text-4xl font-black text-primary">89%</div><div className="text-text-secondary">{t('landing.stat_satisfaction')}</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1762278804884-5680cd6725a5?crop=entropy&cs=srgb&fm=jpg&q=85)', backgroundSize: 'cover' }}></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t('landing.features_title')}</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">{t('landing.features_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-surface border border-border rounded-2xl p-6 hover-lift hover:border-accent/30 transition-all">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t('landing.how_title')}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{ num: '1', title: t('landing.how_step1'), desc: t('landing.how_step1_desc') }, { num: '2', title: t('landing.how_step2'), desc: t('landing.how_step2_desc') }, { num: '3', title: t('landing.how_step3'), desc: t('landing.how_step3_desc') }].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><span className="text-2xl font-black text-primary">{step.num}</span></div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-text-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t('landing.pricing_title')}</h2>
            <p className="text-text-secondary text-lg">{t('landing.pricing_subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div key={index} className={`bg-surface border ${plan.highlighted ? 'border-primary glow-green' : 'border-border'} rounded-2xl p-6 ${plan.highlighted ? 'scale-105' : ''} transition-all hover-lift`}>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4"><span className="text-4xl font-black">{plan.price.toLocaleString()}</span><span className="text-text-secondary"> FCFA/{t('landing.month')}</span></div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start"><Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" /><span className="text-text-secondary text-sm">{feature}</span></li>
                  ))}
                </ul>
                <Link to="/register"><Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'} data-testid={`plan-${plan.name.toLowerCase()}-button`}>{plan.cta}</Button></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16"><h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">{t('landing.testimonials_title')}</h2></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-surface border border-border rounded-2xl p-8">
                <p className="text-lg text-text-secondary mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                  <div><div className="font-bold">{testimonial.name}</div><div className="text-text-muted text-sm">{testimonial.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">{t('landing.cta_title')}</h2>
          <p className="text-xl text-text-secondary mb-8">{t('landing.cta_subtitle')}</p>
          <Link to="/register"><Button size="lg" className="text-lg px-12 glow-green" data-testid="footer-cta-button">{t('landing.cta_button')} <ArrowRight className="ml-2 w-5 h-5" /></Button></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <MessageCircle className="w-6 h-6 text-primary" />
              <span className="text-xl font-heading font-black">WAZA</span>
              <span className="text-text-muted">by Massudom Silicon Valley</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-text-muted text-sm">
              <Link to="/about" className="hover:text-primary transition" data-testid="footer-about-link">{t('footer.about')}</Link>
              <Link to="/privacy" className="hover:text-primary transition" data-testid="footer-privacy-link">{t('footer.privacy')}</Link>
              <Link to="/terms" className="hover:text-primary transition" data-testid="footer-terms-link">{t('footer.terms')}</Link>
              <Link to="/contact" className="hover:text-primary transition" data-testid="footer-contact-link">{t('footer.contact')}</Link>
            </div>
          </div>
          <div className="text-center mt-6 text-text-muted text-xs">&copy; {new Date().getFullYear()} {t('footer.copyright')}</div>
        </div>
      </footer>

      <DemoModal isOpen={showDemo} onClose={() => setShowDemo(false)} />
    </div>
  );
};

export default LandingPage;

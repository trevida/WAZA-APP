import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Bot, Calendar, DollarSign, Megaphone, BarChart3, Shield, Zap, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: "Agent Commercial",
      description: "Qualifiez vos prospects et convertissez 24/7 avec un agent commercial IA professionnel."
    },
    {
      icon: <Calendar className="w-8 h-8 text-primary" />,
      title: "Rappels Automatiques",
      description: "Gérez vos rendez-vous avec des rappels automatiques et des confirmations intelligentes."
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: "Recouvrement",
      description: "Négociez des plans de paiement et maintenez de bonnes relations clients."
    },
    {
      icon: <Megaphone className="w-8 h-8 text-primary" />,
      title: "Campagnes Broadcast",
      description: "Envoyez des messages ciblés à vos segments de clients en un clic."
    }
  ];

  const plans = [
    {
      name: 'Free',
      price: 0,
      features: ['100 messages/mois', '1 agent', '1 workspace', 'Support communautaire'],
      cta: 'Commencer gratuitement',
      highlighted: false,
    },
    {
      name: 'Starter',
      price: 19900,
      features: ['1,500 messages/mois', '1 agent', '1 workspace', 'Support email'],
      cta: 'Essayer Starter',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: 49900,
      features: ['8,000 messages/mois', '5 agents', '3 workspaces', 'Support prioritaire', 'Analytics avancés'],
      cta: 'Passer à Pro',
      highlighted: true,
    },
    {
      name: 'Business',
      price: 99000,
      features: ['Messages illimités', 'Agents illimités', 'Workspaces illimités', 'Support dédié', 'White-label'],
      cta: 'Contacter les ventes',
      highlighted: false,
    },
  ];

  const testimonials = [
    {
      name: 'Amadou Diallo',
      role: 'CEO, SenShop',
      image: 'https://images.unsplash.com/photo-1738750908048-14200459c3c9?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
      quote: 'WAZA a transformé notre service client. Nos ventes ont augmenté de 35% en 2 mois.',
    },
    {
      name: 'Fatou Sall',
      role: 'Directrice Marketing, AfriBank',
      image: 'https://images.unsplash.com/photo-1739300293504-234817eead52?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
      quote: 'L\'automatisation des rappels nous a fait économiser 20h/semaine. Incroyable!',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/30766684/pexels-photo-30766684.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
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
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" data-testid="nav-login-button">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button data-testid="nav-register-button">
                    Essai gratuit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent">
              Ton Agent Commercial sur WhatsApp,
              <br />
              disponible 24/7
            </h1>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-8">
              Automatise tes ventes, rappels et recouvrements avec des agents IA intelligents.
              Conçu pour les entreprises africaines qui veulent grandir.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="text-lg px-8 glow-green" data-testid="hero-cta-button">
                  Essai gratuit <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="hero-demo-button">
                Voir une démo
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-black text-primary">500+</div>
              <div className="text-text-secondary">Entreprises africaines</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary">2M+</div>
              <div className="text-text-secondary">Messages envoyés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-primary">89%</div>
              <div className="text-text-secondary">Taux de satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1762278804884-5680cd6725a5?crop=entropy&cs=srgb&fm=jpg&q=85)',
            backgroundSize: 'cover',
          }}
        ></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              4 Modules Puissants
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Chaque agent est spécialisé pour maximiser vos résultats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-surface border border-border rounded-2xl p-6 hover-lift hover:border-accent/30 transition-all"
              >
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
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Comment ça marche ?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connecte WhatsApp</h3>
              <p className="text-text-secondary">
                Relie ton compte WhatsApp Business en 2 minutes
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Configure ton agent</h3>
              <p className="text-text-secondary">
                Choisis le module et personnalise le comportement de l'IA
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-black text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Regarde les ventes monter</h3>
              <p className="text-text-secondary">
                Ton agent travaille 24/7 pendant que tu te concentres sur l'essentiel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Tarifs transparents
            </h2>
            <p className="text-text-secondary text-lg">
              Commence gratuitement, grandis à ton rythme
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`bg-surface border ${plan.highlighted ? 'border-primary glow-green' : 'border-border'} rounded-2xl p-6 ${plan.highlighted ? 'scale-105' : ''} transition-all hover-lift`}
              >
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-black">{plan.price.toLocaleString()}</span>
                  <span className="text-text-secondary"> FCFA/mois</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <Check className="w-5 h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-text-secondary text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? 'default' : 'outline'}
                    data-testid={`plan-${plan.name.toLowerCase()}-button`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-surface border border-border rounded-2xl p-8">
                <p className="text-lg text-text-secondary mb-6 italic">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-bold">{testimonial.name}</div>
                    <div className="text-text-muted text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-6">
            Lance ton agent en 10 minutes
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Rejoins les entreprises africaines qui automatisent leur croissance
          </p>
          <Link to="/register">
            <Button size="lg" className="text-lg px-12 glow-green" data-testid="footer-cta-button">
              Commencer gratuitement <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
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
            <div className="flex space-x-6 text-text-muted text-sm">
              <a href="#" className="hover:text-primary transition">Confidentialité</a>
              <a href="#" className="hover:text-primary transition">Conditions</a>
              <a href="#" className="hover:text-primary transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

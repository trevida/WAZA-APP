import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Target, Users, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const values = [
    {
      icon: <Target className="w-6 h-6 text-primary" />,
      title: 'Impact local',
      description: 'Nous construisons des outils pensés pour les réalités et les besoins des entreprises africaines.'
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      title: 'Innovation IA',
      description: "Nous exploitons les dernières avancées en intelligence artificielle pour créer des agents conversationnels performants."
    },
    {
      icon: <Users className="w-6 h-6 text-primary" />,
      title: 'Accessibilité',
      description: 'Des tarifs adaptés au marché africain, du plan gratuit au plan enterprise.'
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: 'Vision panafricaine',
      description: "Nous visons à connecter les entreprises de tout le continent avec leurs clients via WhatsApp."
    }
  ];

  const stats = [
    { value: '15+', label: 'Pays couverts' },
    { value: '500+', label: 'Entreprises actives' },
    { value: '2M+', label: 'Messages traités' },
    { value: '24/7', label: 'Disponibilité agents' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="glass-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <MessageCircle className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-black">WAZA</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button>Essai gratuit</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div data-testid="about-page">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>

          <h1 className="text-4xl sm:text-5xl font-black mb-6 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
            À propos de WAZA
          </h1>
          <p className="text-xl text-text-secondary leading-relaxed max-w-3xl">
            WAZA est née d'un constat simple : les entreprises africaines communiquent massivement
            via WhatsApp, mais manquent d'outils pour automatiser et optimiser ces échanges.
            Nous avons créé la première plateforme d'agents IA WhatsApp pensée pour l'Afrique.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-surface/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">Notre mission</h2>
            <p className="text-lg text-text-secondary leading-relaxed">
              Démocratiser l'accès à l'intelligence artificielle pour les entreprises africaines.
              Avec WAZA, chaque PME peut déployer un agent commercial, un assistant de rappels,
              ou un outil de recouvrement intelligent sur WhatsApp — en quelques minutes,
              sans compétences techniques requises.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-black text-primary mb-1">{stat.value}</div>
                  <div className="text-text-secondary text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-surface/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10">Nos valeurs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-surface border border-border rounded-2xl p-6 hover-lift transition-all">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-text-secondary text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">L'équipe</h2>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              WAZA est développé par <strong className="text-text-primary">Massudom Silicon Valley</strong>,
              une startup tech basée à Dakar, Sénégal. Notre équipe combine expertise en IA,
              développement logiciel et connaissance approfondie du marché africain.
            </p>
            <Link to="/contact">
              <Button className="glow-green" data-testid="about-contact-button">
                Rejoignez l'aventure
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-surface/50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Prêt à automatiser votre WhatsApp ?
            </h2>
            <p className="text-text-secondary mb-8">
              Rejoignez les 500+ entreprises africaines qui utilisent WAZA
            </p>
            <Link to="/register">
              <Button size="lg" className="glow-green" data-testid="about-cta-button">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} WAZA by Massudom Silicon Valley. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

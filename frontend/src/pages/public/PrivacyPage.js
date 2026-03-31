import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPage = () => {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="privacy-page">
        <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl sm:text-5xl font-black mb-8 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          Politique de Confidentialité
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          <p className="text-lg">
            Dernière mise à jour : Février 2026
          </p>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Introduction</h2>
            <p>
              Chez WAZA (exploité par Massudom Silicon Valley), nous prenons la protection de vos données personnelles très au sérieux.
              Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations
              lorsque vous utilisez notre plateforme d'agents IA WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>Données d'inscription</strong> : nom, adresse email, mot de passe (chiffré), entreprise</li>
              <li><strong>Données WhatsApp</strong> : numéros de téléphone des contacts, messages échangés via vos agents IA</li>
              <li><strong>Données d'utilisation</strong> : logs de connexion, statistiques d'utilisation des agents, analytics</li>
              <li><strong>Données de paiement</strong> : traitées de manière sécurisée via nos partenaires (Stripe, CinetPay, Flutterwave)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Utilisation des données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Fournir et améliorer nos services d'agents IA WhatsApp</li>
              <li>Gérer votre compte et vos abonnements</li>
              <li>Générer des réponses IA personnalisées pour vos clients</li>
              <li>Produire des analytics et rapports d'activité</li>
              <li>Vous contacter pour le support et les mises à jour importantes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Intelligence Artificielle</h2>
            <p>
              WAZA utilise des modèles d'IA (Claude par Anthropic) pour générer les réponses de vos agents.
              Les conversations sont traitées en temps réel et ne sont pas utilisées pour entraîner des modèles tiers.
              Vous gardez la propriété de vos données conversationnelles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Sécurité</h2>
            <p>
              Nous utilisons des mesures de sécurité conformes aux standards de l'industrie :
              chiffrement SSL/TLS, hachage des mots de passe (bcrypt), tokens JWT sécurisés,
              et hébergement sur des infrastructures certifiées (Railway, Vercel).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Partage des données</h2>
            <p>
              Nous ne vendons jamais vos données. Elles peuvent être partagées uniquement avec :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Nos fournisseurs de services techniques (hébergement, IA, paiement)</li>
              <li>Les autorités compétentes si requis par la loi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Vos droits</h2>
            <p>Conformément aux réglementations applicables, vous avez le droit de :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Accéder à vos données personnelles</li>
              <li>Rectifier ou supprimer vos données</li>
              <li>Exporter vos données (portabilité)</li>
              <li>Retirer votre consentement à tout moment</li>
            </ul>
            <p className="mt-3">
              Pour exercer vos droits, contactez-nous à <a href="mailto:privacy@waza.africa" className="text-primary hover:underline">privacy@waza.africa</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Contact</h2>
            <p>
              Pour toute question relative à cette politique, contactez notre Délégué à la Protection des Données :
              <br />
              Email : <a href="mailto:privacy@waza.africa" className="text-primary hover:underline">privacy@waza.africa</a>
              <br />
              WAZA — Massudom Silicon Valley, Dakar, Sénégal
            </p>
          </section>
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

export default PrivacyPage;

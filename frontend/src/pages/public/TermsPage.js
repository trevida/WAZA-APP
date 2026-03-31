import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsPage = () => {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="terms-page">
        <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl sm:text-5xl font-black mb-8 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          Conditions d'Utilisation
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-text-secondary">
          <p className="text-lg">
            Dernière mise à jour : Février 2026
          </p>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">1. Acceptation des conditions</h2>
            <p>
              En accédant et en utilisant la plateforme WAZA, vous acceptez d'être lié par les présentes
              conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">2. Description du service</h2>
            <p>
              WAZA est une plateforme SaaS qui permet aux entreprises de déployer des agents IA conversationnels
              sur WhatsApp. Les services incluent :
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Création et configuration d'agents IA (vente, rappels, recouvrement, broadcast)</li>
              <li>Gestion des contacts et conversations WhatsApp</li>
              <li>Envoi de campagnes broadcast</li>
              <li>Analytics et rapports de performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">3. Inscription et compte</h2>
            <p>
              Pour utiliser WAZA, vous devez créer un compte avec des informations exactes et à jour.
              Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes
              les activités effectuées sous votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">4. Plans et facturation</h2>
            <p>
              WAZA propose plusieurs plans tarifaires (Free, Starter, Pro, Business).
              Les tarifs sont affichés en FCFA et peuvent être modifiés avec un préavis de 30 jours.
              Les paiements sont traités via Stripe, CinetPay ou Flutterwave selon votre préférence.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Les abonnements sont mensuels et se renouvellent automatiquement</li>
              <li>Vous pouvez annuler à tout moment, effectif à la fin de la période en cours</li>
              <li>Les dépassements de limites de messages entraînent la suspension temporaire du service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">5. Utilisation acceptable</h2>
            <p>Vous vous engagez à ne pas :</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>Utiliser WAZA pour envoyer du spam ou des messages non sollicités</li>
              <li>Violer les conditions d'utilisation de WhatsApp Business</li>
              <li>Utiliser les agents IA pour des activités illégales ou frauduleuses</li>
              <li>Tenter de contourner les limites de votre plan d'abonnement</li>
              <li>Partager vos identifiants de connexion avec des tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">6. Propriété intellectuelle</h2>
            <p>
              WAZA et son code source, design, et contenu sont la propriété de Massudom Silicon Valley.
              Vous conservez la propriété de vos données, contacts et contenus de messages.
              Les réponses générées par l'IA sont considérées comme du contenu créé pour votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">7. Limitation de responsabilité</h2>
            <p>
              WAZA est fourni "en l'état". Nous ne garantissons pas que le service sera ininterrompu
              ou exempt d'erreurs. Notre responsabilité totale est limitée au montant que vous avez payé
              pour le service au cours des 12 derniers mois.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">8. Résiliation</h2>
            <p>
              Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation
              de ces conditions. Vous pouvez résilier votre compte à tout moment depuis les paramètres
              de votre tableau de bord.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">9. Droit applicable</h2>
            <p>
              Ces conditions sont régies par les lois du Cameroun. Tout litige sera soumis aux tribunaux
              compétents de Bandjoun, Cameroun.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-text-primary mb-4">10. Contact</h2>
            <p>
              Pour toute question relative à ces conditions :
              <br />
              Email : <a href="mailto:legal@waza.africa" className="text-primary hover:underline">legal@waza.africa</a>
              <br />
              WAZA — Massudom Silicon Valley, Bandjoun, Cameroun
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

export default TermsPage;

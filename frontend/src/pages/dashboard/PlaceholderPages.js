// Placeholder pages for other dashboard routes
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PlaceholderPage = ({ title, description, ctaText, ctaLink }) => (
  <div className="p-8">
    <div className="max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-heading font-bold mb-4">{title}</h1>
      <p className="text-text-secondary mb-8">{description}</p>
      {ctaLink && (
        <Link to={ctaLink}>
          <Button>{ctaText}</Button>
        </Link>
      )}
    </div>
  </div>
);

export const AgentsPage = () => (
  <PlaceholderPage
    title="Agents IA"
    description="Gérez vos agents WhatsApp intelligents"
    ctaText="Créer un nouvel agent"
    ctaLink="/dashboard/agents/new"
  />
);

export const AgentNew = () => (
  <PlaceholderPage
    title="Créer un Agent"
    description="Configurez votre agent IA"
  />
);

export const AgentEdit = () => (
  <PlaceholderPage
    title="Modifier l'Agent"
    description="Éditez la configuration de votre agent"
  />
);

export const ContactsPage = () => (
  <PlaceholderPage
    title="Contacts"
    description="Gérez votre base de contacts WhatsApp"
    ctaText="Importer des contacts"
    ctaLink="/dashboard/contacts/import"
  />
);

export const ContactsImport = () => (
  <PlaceholderPage
    title="Importer des Contacts"
    description="Importez vos contacts via CSV"
  />
);

export const ConversationsPage = () => (
  <PlaceholderPage
    title="Conversations"
    description="Toutes vos conversations WhatsApp"
  />
);

export const ConversationDetail = () => (
  <PlaceholderPage
    title="Détail de la Conversation"
    description="Historique complet de la conversation"
  />
);

export const BroadcastsPage = () => (
  <PlaceholderPage
    title="Campagnes Broadcast"
    description="Gérez vos campagnes de messages en masse"
    ctaText="Nouvelle campagne"
    ctaLink="/dashboard/broadcasts/new"
  />
);

export const BroadcastNew = () => (
  <PlaceholderPage
    title="Nouvelle Campagne"
    description="Créez une campagne de broadcast"
  />
);

export const AnalyticsPage = () => (
  <PlaceholderPage
    title="Analytics"
    description="Statistiques détaillées de vos agents"
  />
);

export const BillingPage = () => (
  <PlaceholderPage
    title="Abonnement"
    description="Gérez votre plan et votre facturation"
  />
);

export const SettingsPage = () => (
  <PlaceholderPage
    title="Paramètres"
    description="Configuration de votre workspace et WhatsApp"
  />
);

export const OnboardingPage = () => (
  <PlaceholderPage
    title="Bienvenue sur WAZA!"
    description="Configurez votre premier agent en quelques étapes"
  />
);

// Default exports for router
export default {
  AgentsPage,
  AgentNew,
  AgentEdit,
  ContactsPage,
  ContactsImport,
  ConversationsPage,
  ConversationDetail,
  BroadcastsPage,
  BroadcastNew,
  AnalyticsPage,
  BillingPage,
  SettingsPage,
  OnboardingPage,
};

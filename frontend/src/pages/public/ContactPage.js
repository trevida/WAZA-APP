import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success('Message envoyé ! Nous vous répondrons sous 24h.');
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="contact-page">
        <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à l'accueil
        </Link>

        <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          Contactez-nous
        </h1>
        <p className="text-lg text-text-secondary mb-12 max-w-2xl">
          Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner
          dans l'automatisation de votre communication WhatsApp.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <a href="mailto:contact@waza.africa" className="text-text-secondary hover:text-primary transition">
                    contact@waza.africa
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Téléphone</h3>
                  <p className="text-text-secondary">+221 77 123 45 67</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Adresse</h3>
                  <p className="text-text-secondary">
                    Massudom Silicon Valley<br />
                    Dakar, Sénégal
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-3">Horaires de support</h3>
              <div className="space-y-2 text-text-secondary text-sm">
                <div className="flex justify-between">
                  <span>Lundi — Vendredi</span>
                  <span className="text-primary font-medium">8h — 18h GMT</span>
                </div>
                <div className="flex justify-between">
                  <span>Samedi</span>
                  <span className="text-primary font-medium">9h — 14h GMT</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimanche</span>
                  <span className="text-text-muted">Fermé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition"
                    placeholder="Votre nom"
                    data-testid="contact-name-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition"
                    placeholder="votre@email.com"
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sujet</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition"
                  data-testid="contact-subject-select"
                >
                  <option value="">Sélectionnez un sujet</option>
                  <option value="demo">Demande de démonstration</option>
                  <option value="pricing">Question sur les tarifs</option>
                  <option value="support">Support technique</option>
                  <option value="partnership">Partenariat</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition resize-none"
                  placeholder="Décrivez votre demande..."
                  data-testid="contact-message-input"
                />
              </div>

              <Button type="submit" className="w-full glow-green" disabled={sending} data-testid="contact-submit-button">
                {sending ? 'Envoi en cours...' : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} WAZA by Massudom Silicon Valley. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;

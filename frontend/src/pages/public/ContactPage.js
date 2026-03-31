import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ArrowLeft, Mail, MapPin, Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LanguageToggle from '@/components/LanguageToggle';

const ContactPage = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(t('contact.form_success'));
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" data-testid="contact-page">
        <Link to="/" className="inline-flex items-center text-text-muted hover:text-primary transition mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />{t('common.back_home')}
        </Link>

        <h1 className="text-4xl sm:text-5xl font-black mb-4 bg-gradient-to-r from-text-primary to-primary bg-clip-text text-transparent">
          {t('contact.title')}
        </h1>
        <p className="text-lg text-text-secondary mb-12 max-w-2xl">{t('contact.subtitle')}</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold mb-1">{t('contact.email_label')}</h3>
                  <a href="mailto:contact@waza.africa" className="text-text-secondary hover:text-primary transition">contact@waza.africa</a>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><Phone className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold mb-1">{t('contact.phone_label')}</h3>
                  <p className="text-text-secondary">+237 6 99 12 34 56</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="w-5 h-5 text-primary" /></div>
                <div>
                  <h3 className="font-bold mb-1">{t('contact.address_label')}</h3>
                  <p className="text-text-secondary">Massudom Silicon Valley<br />Bandjoun, Cameroun</p>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-3">{t('contact.hours_title')}</h3>
              <div className="space-y-2 text-text-secondary text-sm">
                <div className="flex justify-between"><span>{t('contact.hours_weekday')}</span><span className="text-primary font-medium">{t('contact.hours_weekday_time')}</span></div>
                <div className="flex justify-between"><span>{t('contact.hours_saturday')}</span><span className="text-primary font-medium">{t('contact.hours_saturday_time')}</span></div>
                <div className="flex justify-between"><span>{t('contact.hours_sunday')}</span><span className="text-text-muted">{t('contact.hours_sunday_closed')}</span></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form_name')}</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition"
                    placeholder={t('contact.form_name_placeholder')} data-testid="contact-name-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">{t('contact.form_email')}</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition"
                    placeholder={t('contact.form_email_placeholder')} data-testid="contact-email-input" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.form_subject')}</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition" data-testid="contact-subject-select">
                  <option value="">{t('contact.form_subject_placeholder')}</option>
                  <option value="demo">{t('contact.form_subject_demo')}</option>
                  <option value="pricing">{t('contact.form_subject_pricing')}</option>
                  <option value="support">{t('contact.form_subject_support')}</option>
                  <option value="partnership">{t('contact.form_subject_partnership')}</option>
                  <option value="other">{t('contact.form_subject_other')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.form_message')}</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-primary transition resize-none"
                  placeholder={t('contact.form_message_placeholder')} data-testid="contact-message-input" />
              </div>

              <Button type="submit" className="w-full glow-green" disabled={sending} data-testid="contact-submit-button">
                {sending ? t('contact.form_sending') : (<><Send className="w-4 h-4 mr-2" />{t('contact.form_send')}</>)}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <footer className="border-t border-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-muted text-sm">
          &copy; {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;

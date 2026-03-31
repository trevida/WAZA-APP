import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const toggle = () => {
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
    localStorage.setItem('waza-lang', newLang);
  };

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-border text-xs font-medium hover:bg-surface transition ${className}`}
      data-testid="lang-toggle"
      title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
    >
      <span className={currentLang === 'fr' ? 'opacity-100' : 'opacity-40'}>FR</span>
      <span className="text-text-muted">/</span>
      <span className={currentLang === 'en' ? 'opacity-100' : 'opacity-40'}>EN</span>
    </button>
  );
};

export default LanguageToggle;

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'

const savedLang = localStorage.getItem('hakspace_lang') || 'ar'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

// Apply document direction on startup
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr'
document.documentElement.lang = savedLang

export default i18n

import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'ar' ? 'en' : 'ar'
    i18n.changeLanguage(next)
    localStorage.setItem('hakspace_lang', next)
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = next
  }

  return (
    <button
      onClick={toggle}
      title="Switch language"
      className={`flex items-center gap-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 py-2 ${compact ? 'text-xs' : ''}`}
    >
      <Languages size={15} />
      <span>{t('common.lang_switch')}</span>
    </button>
  )
}

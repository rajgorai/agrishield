import { useLanguage } from '../contexts/LanguageContext'
import { translations } from '../i18n/translations'

export default function useTranslation() {
  const { language } = useLanguage()
  const t = translations[language] || translations.en
  return { t, language }
}
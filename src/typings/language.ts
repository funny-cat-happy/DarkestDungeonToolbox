export type SupportedLanguageType = {
  name: string
  label: string
}

interface languageApiType {
  switchLanguage: (name: string) => void
}

declare global {
  interface Window {
    language: languageApiType
  }
}

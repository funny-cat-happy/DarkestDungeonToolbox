import { createI18n } from 'vue-i18n'
import ZH from '../../locales/zh-CN.json'
import EN from '../../locales/en-US.json'
import TC from '../../locales/tc-CN.json'
import type { SupportedLanguageType } from '@type/language'

let i18n
const init = () => {
  const messages = {
    en: {
      LanguageName: 'English',
      ...EN
    },
    zh: {
      LanguageName: '简体中文',
      ...ZH
    },
    tc: {
      LanguageName: '繁體中文',
      ...TC
    }
  }
  i18n = createI18n({
    legacy: false,
    locale: 'en',
    globalInjection: true,
    messages: messages
  })
  i18n.getSupportedLanguages = () => {
    const languageInfo: SupportedLanguageType[] = []
    const languageName = Object.keys(messages)
    console.log(messages)
    languageName.forEach((name) => {
      languageInfo.push({ name: name, label: messages[name].LanguageName })
    })
    return languageInfo
  }
}

init()

export default i18n

import i18next from 'i18next'
import ZH from '../locales/zh-CN.json'
import EN from '../locales/en-US.json'
import TC from '../locales/tc-CN.json'

const initI18n = () => {
  i18next.init({
    lng: 'en',
    debug: false,
    resources: {
      zh: {
        translation: {
          ...ZH
        }
      },
      en: {
        translation: {
          ...EN
        }
      },
      tc: {
        translation: {
          ...TC
        }
      }
    }
  })
}
export { initI18n }

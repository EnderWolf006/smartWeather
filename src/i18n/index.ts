import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { bitable } from '@lark-base-open/js-sdk';
import resources from './translations';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // 指定降级文案为英文
    interpolation: {
      escapeValue: false,
    },
  });


bitable.bridge.getLanguage().then((lng) => {
  if (i18n.language !== lng) {
    console.log()
    i18n.changeLanguage(lng);
  }
});

export default i18n;
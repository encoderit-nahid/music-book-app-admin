import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en/common.json";
import sv from "@/locales/sv/common.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "sv", label: "Svenska" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

function buildResources(data: any) {
  return {
    common: data,
    page: data.page,
    weekday: data.weekday,
    nav: data.nav,
    breadcrumbs: data.breadcrumbs,
    topbar: data.topbar,
    status: data.status,
    brand: data.brand,
  };
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LANGUAGES.map((l) => l.code),
    resources: {
      en: buildResources(en),
      sv: buildResources(sv),
    },
    defaultNS: "common",
    fallbackNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;

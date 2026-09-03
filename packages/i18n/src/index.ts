export type { Locale } from "./config";
export {
  defaultLocale,
  isLocale,
  localeCookieName,
  locales,
} from "./config";

export { getMessages } from "./messages";
export type { MessageKey } from "./messages/en";
export { I18nProvider, useI18n } from "./provider";

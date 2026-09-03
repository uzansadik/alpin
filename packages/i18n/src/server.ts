import { cookies } from "next/headers";

import { defaultLocale, isLocale, type Locale, localeCookieName } from "./config";

import { getMessages } from "./messages";
import { createTranslator } from "./translate";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();

  const value = cookieStore.get(localeCookieName)?.value;

  if (isLocale(value)) {
    return value;
  }

  return defaultLocale;
}

export async function getTranslations() {
  const locale = await getLocale();
  const messages = await getMessages(locale);

  return createTranslator(messages);
}

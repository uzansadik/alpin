"use server";

import { cookies } from "next/headers";

import { isLocale, type Locale, localeCookieName } from "./config";

export async function setLocaleAction(locale: Locale) {
  if (!isLocale(locale)) {
    throw new Error("Unsupported locale");
  }

  const cookieStore = await cookies();

  cookieStore.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}

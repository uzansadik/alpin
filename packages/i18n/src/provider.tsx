"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useTransition,
} from "react";
import { setLocaleAction } from "./actions";
import type { Locale } from "./config";
import type { MessageKey } from "./messages/en";

type Messages = Record<MessageKey, string>;

type TranslationValues = Record<string, string | number>;

type I18nContextValue = {
  locale: Locale;
  t: (key: MessageKey, values?: TranslationValues) => string;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const t = useCallback(
    (key: MessageKey, values?: TranslationValues) => {
      let message = messages[key];

      if (!values) {
        return message;
      }

      for (const [name, value] of Object.entries(values)) {
        message = message.replaceAll(`{${name}}`, String(value));
      }

      return message;
    },
    [messages],
  );

  const setLocale = useCallback(
    (nextLocale: Locale) => {
      startTransition(async () => {
        await setLocaleAction(nextLocale);
        router.refresh();
      });
    },
    [router],
  );

  const value = useMemo(
    () => ({
      locale,
      t,
      setLocale,
      isPending,
    }),
    [locale, t, setLocale, isPending],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }

  return context;
}

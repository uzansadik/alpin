import { Geist_Mono, Inter } from "next/font/google";

import "@upkick/ui/globals.css";
import { getMessages, I18nProvider } from "@upkick/i18n";
import { getLocale, getTranslations } from "@upkick/i18n/server";
import { TooltipProvider } from "@upkick/ui/components/tooltip";
import { cn } from "@upkick/ui/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <I18nProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}

import type { Locale } from "./config";

export async function getMessages(locale: Locale) {
  switch (locale) {
    case "tr":
      return (await import("./messages/tr")).tr;

    default:
      return (await import("./messages/en")).en;
  }
}

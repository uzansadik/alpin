import type { MessageKey } from "./messages/en";

type Messages = Record<MessageKey, string>;

type Values = Record<string, string | number>;

export function createTranslator(messages: Messages) {
  return function t(key: MessageKey, values?: Values) {
    let message = messages[key];

    if (!values) {
      return message;
    }

    for (const [name, value] of Object.entries(values)) {
      message = message.replaceAll(`{${name}}`, String(value));
    }

    return message;
  };
}

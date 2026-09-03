export const en = {
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.confirm": "Confirm",

  "navigation.dashboard": "Dashboard",
  "navigation.settings": "Settings",
  "navigation.organization": "Organization",

  "dashboard.title": "Dashboard",
  "dashboard.welcome": "Welcome back, {name}",
  "dashboard.members": "Members",

  "settings.title": "Settings",
  "settings.language": "Language",

  "language.english": "English",
  "language.turkish": "Türkçe",

  "auth.login": "Log in",
  "auth.logout": "Log out",
  "auth.register": "Create account",
} as const;

export type MessageKey = keyof typeof en;

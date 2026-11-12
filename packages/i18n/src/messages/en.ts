export const en = {
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.edit": "Edit",
  "common.confirm": "Confirm",

  "navigation.dashboard": "Dashboard",
  "navigation.settings": "Settings",

  "dashboard.title": "Dashboard",
  "dashboard.welcome": "Welcome back, {name}",
  "dashboard.organization": "Organization",
  "dashboard.organizationHint": "Organization id from mqdms",
  "dashboard.platformRole": "Platform role",
  "dashboard.roles": "Roles",
  "dashboard.permissions": "Permissions",
  "dashboard.access": "Your access",
  "dashboard.accessDescription":
    "Roles and permissions are published by mqdms and refreshed on every sign-in.",
  "dashboard.none": "None",

  "settings.title": "Settings",
  "settings.language": "Language",

  "language.english": "English",
  "language.turkish": "Türkçe",

  "auth.login": "Log in",
  "auth.logout": "Log out",

  "auth.login.title": "Sign in",
  "auth.login.description": "Continue with your mqdms account.",
  "auth.login.submitting": "Signing in...",
  "auth.login.continueWithMqdms": "Continue with mqdms",
  "auth.login.mqdmsHint": "Your account, organization and permissions are managed by mqdms.",

  "auth.layout.headline": "Build and manage your work in one place.",
  "auth.layout.description":
    "A modern SaaS application starter kit. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
  "auth.layout.copyright": "© {year} {name}",

  "auth.managedByMqdms": "Managed by mqdms",

  "auth.noWorkspace.title": "No organization yet",
  "auth.noWorkspace.description":
    "Your mqdms account is not linked to an organization. Join or create one in mqdms, then sign in again.",
  "auth.noWorkspace.manage": "Manage in mqdms",
  "auth.noWorkspace.signOut": "Sign out",
} as const;

export type MessageKey = keyof typeof en;

import type { MessageKey } from "./en";

export const tr = {
  "common.save": "Kaydet",
  "common.cancel": "İptal",
  "common.delete": "Sil",
  "common.edit": "Düzenle",
  "common.confirm": "Onayla",

  "navigation.dashboard": "Kontrol Paneli",
  "navigation.settings": "Ayarlar",

  "dashboard.title": "Kontrol Paneli",
  "dashboard.welcome": "Tekrar hoş geldin, {name}",
  "dashboard.organization": "Organizasyon",
  "dashboard.organizationHint": "mqdms'ten gelen organizasyon id",
  "dashboard.platformRole": "Platform rolü",
  "dashboard.roles": "Roller",
  "dashboard.permissions": "İzinler",
  "dashboard.access": "Erişiminiz",
  "dashboard.accessDescription":
    "Roller ve izinler mqdms tarafından yayınlanır ve her girişte tazelenir.",
  "dashboard.none": "Yok",

  "settings.title": "Ayarlar",
  "settings.language": "Dil",

  "language.english": "English",
  "language.turkish": "Türkçe",

  "auth.login": "Giriş yap",
  "auth.logout": "Çıkış yap",

  "auth.login.title": "Giriş yap",
  "auth.login.description": "mqdms hesabınızla devam edin.",
  "auth.login.submitting": "Giriş yapılıyor...",
  "auth.login.continueWithMqdms": "mqdms ile devam et",
  "auth.login.mqdmsHint": "Hesabınız, organizasyonunuz ve izinleriniz mqdms tarafından yönetilir.",

  "auth.layout.headline": "İşinizi tek bir yerden oluşturun ve yönetin.",
  "auth.layout.description":
    "Next.js, TypeScript, Tailwind CSS ve shadcn/ui ile hazırlanmış modern SaaS uygulama başlangıç kiti.",
  "auth.layout.copyright": "© {year} {name}",

  "auth.managedByMqdms": "mqdms tarafından yönetilir",

  "auth.noWorkspace.title": "Henüz organizasyon yok",
  "auth.noWorkspace.description":
    "mqdms hesabınız bir organizasyona bağlı değil. mqdms'te bir organizasyona katılın veya oluşturun, ardından tekrar giriş yapın.",
  "auth.noWorkspace.manage": "mqdms'de yönet",
  "auth.noWorkspace.signOut": "Çıkış yap",
} satisfies Record<MessageKey, string>;

import type { MessageKey } from "./en";

export const tr = {
  "common.save": "Kaydet",
  "common.cancel": "İptal",
  "common.delete": "Sil",
  "common.edit": "Düzenle",
  "common.confirm": "Onayla",

  "navigation.dashboard": "Kontrol Paneli",
  "navigation.settings": "Ayarlar",
  "navigation.organization": "Organizasyon",

  "dashboard.title": "Kontrol Paneli",
  "dashboard.welcome": "Tekrar hoş geldin, {name}",
  "dashboard.members": "Üyeler",

  "settings.title": "Ayarlar",
  "settings.language": "Dil",

  "language.english": "English",
  "language.turkish": "Türkçe",

  "auth.login": "Giriş yap",
  "auth.logout": "Çıkış yap",
  "auth.register": "Hesap oluştur",
} satisfies Record<MessageKey, string>;

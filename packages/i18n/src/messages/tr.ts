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

  "auth.login.title": "Giriş yap",
  "auth.login.description": "Devam etmek için bilgilerinizi girin.",
  "auth.login.email": "E-posta",
  "auth.login.password": "Şifre",
  "auth.login.forgotPassword": "Şifremi unuttum",
  "auth.login.submit": "Giriş yap",
  "auth.login.submitting": "Giriş yapılıyor...",
  "auth.login.error": "Giriş yapılamadı. Lütfen tekrar deneyin.",
  "auth.login.noAccount": "Hesabınız yoksa kurum yöneticinizden destek isteyin.",

  "auth.layout.headline": "İşinizi tek bir yerden oluşturun ve yönetin.",
  "auth.layout.description":
    "Next.js, TypeScript, Tailwind CSS ve shadcn/ui ile hazırlanmış modern SaaS uygulama başlangıç kiti.",
  "auth.layout.copyright": "© {year} {name}",

  "auth.register.title": "Kayıt kapalı",
  "auth.register.warningTitle": "Sistem tarafından kayıt yapılamaz",
  "auth.register.warningDescription":
    "Kullanıcı hesapları kurum yöneticisi tarafından açılır, kayıt formları kapalıdır. Hesabınız yoksa kurum yöneticinizle iletişime geçin.",
  "auth.register.backToLogin": "Giriş sayfasına dön",
} satisfies Record<MessageKey, string>;

"use client";

import { useI18n } from "@upkick/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@upkick/ui/components/select";

export function LanguageSelect() {
  const { locale, setLocale, isPending } = useI18n();

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(value as "en" | "tr")}
      disabled={isPending}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="en">English</SelectItem>

        <SelectItem value="tr">Türkçe</SelectItem>
      </SelectContent>
    </Select>
  );
}

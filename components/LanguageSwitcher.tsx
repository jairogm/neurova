"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Languages, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setUserLocale } from "@/i18n/locale";
import { Locale, locales, localeLabels } from "@/i18n/config";

export function LanguageSwitcher() {
  const t = useTranslations("language");
  const activeLocale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();

  const onSelect = (locale: Locale) => {
    if (locale === activeLocale) return;
    startTransition(() => {
      // Server action persists the cookie and triggers a re-render
      // with the newly selected locale's messages.
      setUserLocale(locale);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("changeLanguage")}
        title={t("changeLanguage")}
        disabled={isPending}
        className="inline-flex size-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        <Languages className="size-5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onSelect={() => onSelect(locale)}
            aria-current={locale === activeLocale ? "true" : undefined}
            className="flex items-center justify-between gap-4"
          >
            <span>{localeLabels[locale]}</span>
            {locale === activeLocale && (
              <Check className="size-4 text-sky-600" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

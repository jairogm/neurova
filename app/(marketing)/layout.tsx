import { getLocale } from "next-intl/server";
import { getLanding } from "@/lib/landing";

import { MarketingThemeSwitch } from "@/components/MarketingThemeSwitch";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const { styles, header, footer } = getLanding(locale);
  return (
    <div className="neurova-marketing-page landing-shell">
      <div className="contents" dangerouslySetInnerHTML={{ __html: styles + header }} />
      <MarketingThemeSwitch spanish={locale === "es"} />
      {children}
      <div dangerouslySetInnerHTML={{ __html: footer }} />
    </div>
  );
}

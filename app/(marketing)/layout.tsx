import { getLocale } from "next-intl/server";
import { getLanding } from "@/lib/landing";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { styles, header, footer } = getLanding(await getLocale());
  return (
    <div className="neurova-marketing-page landing-shell">
      <div className="contents" dangerouslySetInnerHTML={{ __html: styles + header }} />
      {children}
      <div dangerouslySetInnerHTML={{ __html: footer }} />
    </div>
  );
}

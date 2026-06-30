import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import "./globals.css";
import { TanstackProvider } from "@/providers/TanstackProvider";
import { SessionTimeoutProvider } from "@/providers/SessionTimeoutProvider";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { UserSync } from "@/components/UserSync";
import { CookieBanner } from "@/components/CookieBanner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "NEUROVA",
  description: "A comprehensive platform for mental health professionals",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>
              <UserSync />
              <SessionTimeoutProvider
                timeoutMinutes={22}
                warningMinutes={2}
              >
                <TanstackProvider>
                  {children}
                  <CookieBanner />
                  <Toaster richColors position="top-right" />
                </TanstackProvider>
              </SessionTimeoutProvider>
            </ConvexClientProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

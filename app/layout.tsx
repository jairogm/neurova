import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { TanstackProvider } from "@/providers/TanstackProvider";
import { SessionTimeoutProvider } from "@/providers/SessionTimeoutProvider";
import { Toaster } from "@/components/ui/sonner";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { UserSync } from "@/components/UserSync";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "NEUROVA",
  description: "A comprehensive platform for mental health professionals",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
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
                <Toaster richColors position="top-right" />
              </TanstackProvider>
            </SessionTimeoutProvider>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

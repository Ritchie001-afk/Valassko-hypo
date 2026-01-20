import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://finance-valassko.cz"),
  title: {
    default: "Hypotéka Valašsko | Nezávislé srovnání hypoték",
    template: "%s | Finance Valašsko",
  },
  description:
    "Spočočítejte si nejvýhodnější hypotéku na Valašsku. Nezávislé srovnání hypoték, refinancování a pojištění. Kompletní servis pro Rožnov, Vsetín, Valašské Meziříčí a okolí.",
  keywords: [
    "hypotéka",
    "kalkulačka hypotéky",
    "finance",
    "Valašsko",
    "refinancování",
    "pojištění",
    "Rožnov pod Radhoštěm",
    "Vsetín",
    "Valašské Meziříčí",
  ],
  authors: [{ name: "Finance Valašsko" }],
  creator: "Finance Valašsko",
  publisher: "Finance Valašsko",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Hypotéka Valašsko | Nezávislé srovnání hypoték 2026",
    description:
      "Spočočítejte si nejvýhodnější hypotéku na Valašsku během 2 minut. Nezávislé srovnání hypoték a kompletní servis zdarma.",
    url: "https://finance-valassko.cz",
    siteName: "Finance Valašsko",
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypotéka Valašsko | Nezávislé srovnání hypoték",
    description: "Spočočítejte si nejvýhodnější hypotéku na Valašsku. Srovnání bank na jednom místě.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://finance-valassko.cz",
  },
};

import Script from "next/script";
import CookieConsent from "@/components/CookieConsent";

// ... imports remain the same

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HT013R9943"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-HT013R9943');
          `}
        </Script>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}

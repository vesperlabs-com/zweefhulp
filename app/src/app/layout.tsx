import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Zweefhulp — Doorzoek verkiezingsprogramma's met AI",
    template: "%s | Zweefhulp"
  },
  description: "Een AI-aangedreven zoektool om verkiezingsprogramma's van de Tweede Kamerverkiezingen 2025 semantisch te doorzoeken en vergelijken. Vind relevante standpunten op basis van betekenis, niet alleen exacte zoektermen.",
  keywords: ["verkiezingen", "tweede kamer", "2025", "verkiezingsprogramma", "politiek", "stemmen", "vergelijken", "AI", "zoeken"],
  authors: [
    { name: "Robert Gaal", url: "https://gaal.co" },
    { name: "Stefan Borsje", url: "https://stefanborsje.com/" }
  ],
  creator: "Robert Gaal & Stefan Borsje",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://zweefhulp.nl",
    title: "Zweefhulp — Doorzoek verkiezingsprogramma's met AI",
    description: "Doorzoek alle verkiezingsprogramma's voor de Tweede Kamerverkiezingen 2025 met AI-aangedreven semantisch zoeken.",
    siteName: "Zweefhulp"
  },
  twitter: {
    card: "summary_large_image",
    title: "Zweefhulp — Doorzoek verkiezingsprogramma's met AI",
    description: "Doorzoek alle verkiezingsprogramma's voor de Tweede Kamerverkiezingen 2025 met AI-aangedreven semantisch zoeken.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body
        className={`${inter.variable} ${barlowCondensed.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

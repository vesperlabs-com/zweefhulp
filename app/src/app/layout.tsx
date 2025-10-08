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
  title: {
    default: "Zweefhulp - Doorzoek verkiezingsprogramma's 2025",
    template: "%s | Zweefhulp"
  },
  description: "Een AI-aangedreven zoektool om verkiezingsprogramma's van de Tweede Kamerverkiezingen 2025 semantisch te doorzoeken en vergelijken. Vind relevante standpunten op basis van betekenis, niet alleen exacte zoektermen.",
  keywords: ["verkiezingen", "tweede kamer", "2025", "verkiezingsprogramma", "politiek", "stemmen", "vergelijken", "AI", "zoeken"],
  authors: [
    { name: "Robert Gaal", url: "https://gaal.co" },
    { name: "Stefan Borsje", url: "https://stefanborsje.com/" }
  ],
  creator: "Robert Gaal & Stefan Borsje",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    url: "https://zweefhulp.nl",
    title: "Zweefhulp - Doorzoek verkiezingsprogramma's 2025",
    description: "Doorzoek alle verkiezingsprogramma's voor de Tweede Kamerverkiezingen 2025 met AI-aangedreven semantisch zoeken.",
    siteName: "Zweefhulp"
  },
  twitter: {
    card: "summary_large_image",
    title: "Zweefhulp - Doorzoek verkiezingsprogramma's 2025",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Geist_Mono } from "next/font/google";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Fase Sport — Uniformes Esportivos Personalizados",
    template: "%s | Fase Sport",
  },
  description:
    "Uniformes esportivos personalizados para times, academias e atléticas em Teixeira de Freitas-BA. Futebol, vôlei, basquete e mais. Solicite seu orçamento.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://fasesport.com"
  ),
  openGraph: {
    siteName: "Fase Sport",
    locale: "pt_BR",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${barlowCondensed.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem("fase_theme");if(s==="dark"){document.documentElement.classList.add("dark")}else if(s==="light"){document.documentElement.classList.remove("dark")}else{var m=window.matchMedia("(prefers-color-scheme:dark)");if(m.matches)document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
      </body>
    </html>
  );
}

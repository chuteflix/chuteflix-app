import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";
import { getSettings } from "@/services/settings";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const appName = settings?.appName || "ChuteFlix Bolão App";
  const description = settings?.metaDescription || "Apostas e diversão no mundo do futebol.";
  const keywords = settings?.metaKeywords || "bolão, futebol, apostas, prêmios";
  const favicon = settings?.faviconUrl || "/favicon.ico"; 

  return {
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description: description,
    keywords: keywords,
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: 'device-width',
  initialScale: 1,
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-body antialiased">
        {/* AuthProvider foi movido para o MainLayout para ter acesso às props do servidor */}
        {children}
        <Toaster />
      </body>
    </html>
  );
}

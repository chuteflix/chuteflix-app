import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { AuthProvider } from "@/context/auth-context";
import { getSettings } from "@/services/settings";
import { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

// Função para gerar metadados dinamicamente
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: settings?.appName || "ChuteFlix",
    description: settings?.metaDescription || "A plataforma definitiva para os amantes de futebol. Participe de bolões, dê seus palpites e concorra a prêmios incríveis.",
    keywords: settings?.metaKeywords || "bolão, futebol, palpites, apostas, prêmios",
    icons: {
      icon: settings?.faviconUrl || '/favicon.ico',
    },
  };
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

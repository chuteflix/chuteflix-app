import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";
import { AuthProvider } from "@/context/auth-context";
import { PublicHeader } from "@/components/public-header";
import DynamicStyler from "@/components/dynamic-styler"; // Importado

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ChuteFlix",
  description: "A plataforma definitiva para os amantes de futebol. Participe de bolões, dê seus palpites e concorra a prêmios incríveis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <AuthProvider>
          <DynamicStyler /> {/* Adicionado aqui */}
          <ToastProvider />
          <div className="flex flex-col min-h-screen">
            <PublicHeader />
            <main className="flex-grow pt-16">{children}</main> {/* pt-16 para não sobrepor o cabeçalho fixo */}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
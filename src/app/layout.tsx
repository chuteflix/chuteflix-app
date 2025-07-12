"use client"

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-context";

// Metadata cannot be exported from a client component.
// We can keep it here, but it won't be used by Next.js.
// For metadata in client components, you would typically handle it
// in a parent server component or using the `use-metadata` hook if needed.
// export const metadata: Metadata = {
//   title: "ChuteFlix Bolão App",
//   description: "Apostas e diversão no mundo do futebol.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <title>ChuteFlix Bolão App</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

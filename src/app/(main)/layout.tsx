
import { getSettings } from "@/services/settings";
import { LayoutClient } from "./layout-client";

// Este componente permanece no servidor para buscar os dados.
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Busca as configurações no servidor, uma única vez.
  const settings = await getSettings();

  // A lógica de renderização, provedores de contexto e componentes de cliente
  // são todos delegados para o LayoutClient.
  return (
    <LayoutClient settings={settings}>
      {children}
    </LayoutClient>
  );
}

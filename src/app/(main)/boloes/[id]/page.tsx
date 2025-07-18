
import { getBoloes } from "@/services/boloes";
import { BolaoPageClient } from "@/components/bolao-page-client";

// Esta função roda no servidor durante o build
export async function generateStaticParams() {
  const boloes = await getBoloes();
 
  return boloes.map((bolao) => ({
    id: bolao.id,
  }));
}

// Este é o componente de servidor
export default function BolaoPage({ params }: { params: { id: string } }) {
  // Ele simplesmente renderiza o componente de cliente, passando o ID
  return <BolaoPageClient id={params.id} />;
}

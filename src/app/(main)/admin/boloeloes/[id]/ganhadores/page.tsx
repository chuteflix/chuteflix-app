
import { getBoloes } from "@/services/boloes";
import { GanhadoresPageClient } from "@/components/admin/ganhadores-client";

// Esta função roda no servidor durante o build
export async function generateStaticParams() {
  // Apenas gere esta página para bolões que já foram finalizados
  const boloes = await getBoloes();
  const finalizados = boloes.filter(b => b.status === 'Finalizado');
 
  return finalizados.map((bolao) => ({
    id: bolao.id,
  }));
}

// Este é o componente de servidor
export default function GanhadoresPage({ params }: { params: { id: string } }) {
  // Ele simplesmente renderiza o componente de cliente, passando o ID
  return <GanhadoresPageClient id={params.id} />;
}

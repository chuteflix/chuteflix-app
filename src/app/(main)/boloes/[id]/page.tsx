
import { getBoloes, getBolaoById } from "@/services/boloes";
import { BolaoPageClient } from "@/components/bolao-page-client";
import { getTeamById } from "@/services/teams";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const boloes = await getBoloes();
  return boloes.map((bolao) => ({
    id: bolao.id,
  }));
}

export default async function BolaoPage({ params }: { params: { id: string } }) {
  const bolaoBase = await getBolaoById(params.id);

  if (!bolaoBase) {
    return notFound();
  }

  const [teamADetails, teamBDetails] = await Promise.all([
    getTeamById(bolaoBase.teamAId),
    getTeamById(bolaoBase.teamBId),
  ]);

  const bolaoDetails = {
    ...bolaoBase,
    teamADetails,
    teamBDetails,
  };
  
  return <BolaoPageClient bolaoDetails={bolaoDetails} />;
}

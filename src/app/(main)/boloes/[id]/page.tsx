
import { getBoloes, getBolaoById } from "@/services/boloes";
import { BolaoPageClient } from "@/components/bolao-page-client";
import { getTeamById } from "@/services/teams";
import { getChampionshipById } from "@/services/championships";
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

  const [teamADetails, teamBDetails, championshipDetails] = await Promise.all([
    getTeamById(bolaoBase.teamAId),
    getTeamById(bolaoBase.teamBId),
    getChampionshipById(bolaoBase.championshipId),
  ]);

  const bolaoDetails = {
    ...bolaoBase,
    teamADetails,
    teamBDetails,
    championshipDetails,
  };
  
  return <BolaoPageClient bolaoDetails={bolaoDetails} />;
}

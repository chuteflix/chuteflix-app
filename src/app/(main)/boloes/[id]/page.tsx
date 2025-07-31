
import { getBoloes, getBolaoById } from "@/services/boloes";
import { BolaoPageClient } from "@/components/bolao-page-client";
import { getTeamById } from "@/services/teams";
import { notFound } from "next/navigation";
import { Metadata } from 'next';

interface BolaoPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: BolaoPageProps): Promise<Metadata> {
  const bolao = await getBolaoById(params.id);

  if (!bolao) {
    return {
      title: "Bolão não encontrado",
    };
  }

  const title = `Bolão: ${bolao.homeTeam.name} vs ${bolao.awayTeam.name}`;
  const description = `Participe do bolão entre ${bolao.homeTeam.name} e ${bolao.awayTeam.name} e concorra a prêmios incríveis. Dê o seu palpite!`;
  const imageUrl = bolao.homeTeam.shieldUrl || bolao.awayTeam.shieldUrl || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}


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
    getTeamById(bolaoBase.homeTeam.id),
    getTeamById(bolaoBase.awayTeam.id),
  ]);

  const bolaoDetails = {
    ...bolaoBase,
    teamADetails,
    teamBDetails,
  };
  
  return <BolaoPageClient bolaoDetails={bolaoDetails} />;
}

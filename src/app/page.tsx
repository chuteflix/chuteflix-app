
"use client"

import { useState, useEffect, useMemo } from "react"
import { getBoloes, Bolao } from "@/services/boloes"
import { getTeams, Team } from "@/services/teams"
import { getChampionships, Championship } from "@/services/championships"
import { getParticipantCount } from "@/services/palpites"
import { Skeleton } from "@/components/ui/skeleton"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BoloesCarousel } from "@/components/boloes-carousel"
import { HeroSection } from "@/components/hero-section"
import { Tv, Medal, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { PublicHeader } from "@/components/public-header"

type BolaoComDetalhes = Bolao & {
  teamADetails?: Team;
  teamBDetails?: Team;
  championshipDetails?: Championship;
  participantCount?: number;
};

const useCategorizedBoloes = (boloes: BolaoComDetalhes[]) => {
  return useMemo(() => {
    const customCategories = boloes.reduce((acc, bolao) => {
      bolao.categories?.forEach(category => {
        if (!acc[category]) {
          acc[category] = {};
        }
        bolao.subcategories?.forEach(subcategory => {
          if (!acc[category][subcategory]) {
            acc[category][subcategory] = [];
          }
          acc[category][subcategory].push(bolao);
        });
      });
      return acc;
    }, {} as Record<string, Record<string, BolaoComDetalhes[]>>);

    const customCategoryCarousels = Object.entries(customCategories).flatMap(([category, subcategories]) => 
      Object.entries(subcategories).map(([subcategory, boloes]) => ({
        title: `${category} - ${subcategory}`,
        boloes
      }))
    );
    
    const categories = [
      ...customCategoryCarousels
    ].filter(category => category.boloes.length > 0);

    return categories;
  }, [boloes]);
};

const features = [
    {
      icon: <Tv className="h-8 w-8 text-primary" />,
      title: "Participe de Onde Quiser",
      description: "Acesse os bolões no seu computador, TV, celular ou tablet."
    },
    {
      icon: <Medal className="h-8 w-8 text-primary" />,
      title: "Prêmios em Dinheiro",
      description: "Acerte os palpites e ganhe prêmios reais, pagos com segurança via PIX."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Crie Bolões com Amigos",
      description: "Desafie seus amigos em bolões privados e mostre quem entende mais de futebol."
    }
]

const faqData = [
  {
    question: "O que é o ChuteFlix?",
    answer: "ChuteFlix é a maior plataforma de bolões esportivos da América Latina. Oferecemos uma experiência de 'streaming' de bolões, onde você pode participar, dar seus palpites e ganhar prêmios de forma divertida e segura."
  },
  {
    question: "Como eu participo?",
    answer: "O cadastro na plataforma é gratuito. Após se registrar, escolha um bolão, pague o valor da aposta indicado e envie seu palpite. Seu palpite será validado após a confirmação do pagamento pela nossa equipe administrativa. Simples e transparente!"
  },
  {
    question: "Como recebo meus prêmios?",
    answer: "Os prêmios são pagos diretamente na sua chave PIX cadastrada. Na sua área de 'Configurações', você pode definir sua chave PIX (CPF, e-mail, telefone ou chave aleatória) de forma rápida e segura."
  },
  {
    question: "É seguro participar?",
    answer: "Sim! Nossa plataforma utiliza as melhores práticas de segurança para proteger seus dados e garantir que todos os pagamentos e premiações sejam processados de forma segura e transparente."
  }
];

export default function PublicHomePage() {
  const [boloes, setBoloes] = useState<BolaoComDetalhes[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [boloesData, teamsData, championshipsData] = await Promise.all([
          getBoloes(),
          getTeams(),
          getChampionships(),
        ]);

        const availableBoloes = boloesData.filter(b => b.status !== 'Finalizado');

        const detailedBoloes = await Promise.all(
          availableBoloes.map(async (bolao) => {
            const [teamADetails, teamBDetails, championshipDetails, participantCount] = await Promise.all([
              teamsData.find(t => t.id === bolao.teamAId),
              teamsData.find(t => t.id === bolao.teamBId),
              championshipsData.find(c => c.id === bolao.championshipId),
              getParticipantCount(bolao.id)
            ]);
            return { ...bolao, teamADetails, teamBDetails, championshipDetails, participantCount };
          })
        );
        
        setBoloes(detailedBoloes);

      } catch (error) {
        console.error("Falha ao buscar dados para a home page:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categorizedBoloes = useCategorizedBoloes(boloes);

  const renderSkeleton = () => (
    <div className="mb-12">
        <Skeleton className="h-8 w-1/3 mb-6" />
        <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 w-80 rounded-lg" />)}
        </div>
    </div>
  )

  return (
    <div className="bg-background text-foreground">
      <PublicHeader />
      <HeroSection />
      
      <main>
        <Separator className="bg-border/20" />
        <section id="features" className="container mx-auto py-16 sm:py-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold">A maior plataforma de bolões da América Latina</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Tudo o que você precisa para se divertir e competir, em um só lugar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {features.map(feature => (
                    <div key={feature.title} className="flex flex-col items-center text-center">
                        {feature.icon}
                        <h3 className="text-xl font-semibold mt-6">{feature.title}</h3>
                        <p className="text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
        <Separator className="bg-border/20" />

        <section id="boloes" className="container mx-auto py-16 sm:py-24">
             {loading ? (
                renderSkeleton()
            ) : boloes.length > 0 ? (
                categorizedBoloes.map(({ title, boloes }) => (
                  <BoloesCarousel key={title} title={title} boloes={boloes} />
                ))
            ) : (
                <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-20">
                    <h3 className="text-2xl font-bold">Nenhum bolão em destaque no momento.</h3>
                    <p className="text-muted-foreground mt-2">Fique de olho! Novas oportunidades em breve.</p>
                </div>
            )}
        </section>

        <Separator className="bg-border/20" />
        <section id="faq" className="container mx-auto max-w-4xl py-16 sm:py-24">
            <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground">
                            {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </section>
      </main>

      <footer className="border-t border-border/20">
          <div className="container mx-auto text-center py-6">
            <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} ChuteFlix. Todos os direitos reservados.
            </p>
          </div>
      </footer>
    </div>
  )
}

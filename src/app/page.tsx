"use client"

import { useState, useEffect, useMemo } from "react";
import { getAllCategories, Category } from "@/services/categories";
import { getBoloes, Bolao } from "@/services/boloes";
import { getSettings, Settings } from "@/services/settings";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HeroSection } from "@/components/hero-section";
import { Smartphone, PiggyBank, Handshake, Search, Rocket, ShieldCheck, Banknote } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PublicHeader } from "@/components/public-header";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CategoryShelf } from "@/components/category-shelf";

const features = [
    {
      icon: <Rocket className="h-12 w-12 text-primary" />,
      title: "Dê o Play na Emoção",
      description: "Navegue pelo nosso acervo de bolões como se estivesse em um streaming. Escolha o jogo, faça sua aposta e comece a torcer instantaneamente."
    },
    {
      icon: <Banknote className="h-12 w-12 text-primary" />,
      title: "Saque Seus Ganhos Via PIX",
      description: "Acertou o palpite? O prêmio vai direto para o seu saldo. Solicite o saque e receba seu lucro de forma rápida e segura diretamente na sua conta via PIX."
    },
    {
      icon: <ShieldCheck className="h-12 w-12 text-primary" />,
      title: "Segurança Nível Streaming",
      description: "Sua conta é blindada. Seus depósitos, apostas e saques são protegidos com a mesma tecnologia das grandes plataformas que você já confia."
    }
]

const faqData = {
  "Como Começar": [
    {
      question: "Como funciona para apostar?",
      answer: "É simples e instantâneo, como escolher um filme: 1) Faça um depósito rápido via PIX para adicionar saldo à sua carteira. 2) Navegue pelos bolões e escolha um jogo. 3) Insira seu palpite e confirme. O valor da aposta é debitado automaticamente do seu saldo e seu chute é validado na hora. Sem esperas, sem complicações."
    },
    {
      question: "O cadastro é realmente gratuito?",
      answer: "Sim, 100% gratuito. Você pode criar sua conta, explorar todos os bolões disponíveis e navegar pela plataforma sem nenhum custo. Você só precisa ter saldo em conta na hora de confirmar um palpite para entrar na disputa pelos prêmios."
    }
  ],
  "Segurança e Pagamentos": [
    {
      question: "Meu dinheiro está seguro na plataforma?",
      answer: "Totalmente. Usamos protocolos de segurança de ponta para proteger seus dados e seu saldo. As transações de depósito e saque são verificadas manualmente por nossa equipe para garantir que todo o processo seja seguro, mas o uso do saldo para apostas dentro da plataforma é instantâneo e automático."
    },
    {
      question: "Como os prêmios são pagos?",
      answer: "Quando um bolão que você ganhou é finalizado, o valor do prêmio é creditado AUTOMATICAMENTE no seu saldo ChuteFlix. A partir daí, você pode usar o saldo para fazer novas apostas ou solicitar um saque para sua chave PIX cadastrada. O dinheiro é seu, o controle é seu."
    }
  ],
  "Sobre o ChuteFlix": [
    {
      question: "O que é o 'streaming de bolões'?",
      answer: "É a nossa grande inovação. Em vez de uma plataforma de apostas tradicional e estática, criamos uma experiência fluida e imersiva. Você navega por um 'catálogo' de jogos, os bolões são as 'produções originais' e a emoção do futebol é a 'estrela principal'. É a forma mais moderna e divertida de participar de bolões online."
    }
  ]
};

export default function PublicHomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [appSettings, setAppSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const [faqSearchTerm, setFaqSearchTerm] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [fetchedCategories, fetchedSettings] = await Promise.all([
          getAllCategories(),
          getSettings()
        ]);
        setCategories(fetchedCategories.filter(c => !c.parentId)); 
        setAppSettings(fetchedSettings);
      } catch (error) {
        console.error("Falha ao buscar dados iniciais:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const filteredFaqData = useMemo(() => {
    if (!faqSearchTerm) {
      return faqData;
    }
    const filtered: typeof faqData = {};
    for (const category in faqData) {
      // @ts-ignore
      const questions = faqData[category].filter(faq =>
        faq.question.toLowerCase().includes(faqSearchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqSearchTerm.toLowerCase())
      );
      if (questions.length > 0) {
        // @ts-ignore
        filtered[category] = questions;
      }
    }
    return filtered;
  }, [faqSearchTerm]);
  
  const renderCategorySkeletons = () => (
    <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
             <div key={i}>
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="flex space-x-4">
                    <Skeleton className="h-48 w-64 rounded-lg" />
                    <Skeleton className="h-48 w-64 rounded-lg" />
                    <Skeleton className="h-48 w-64 rounded-lg" />
                </div>
            </div>
        ))}
    </div>
  );

  return (
    <div className="bg-background text-foreground">
      <PublicHeader showNavLinks={true} settings={appSettings} /> {/* Passando appSettings como prop */}
      <HeroSection 
        title={appSettings?.homeHeroTitle || "ChuteFlix: Onde o Futebol Vira Emoção. Sem Pausas."}
        subtitle={appSettings?.homeHeroSubtitle || "O primeiro streaming de bolões da América Latina. Escolha seu jogo, dê seu palpite e sinta a adrenalina de cada lance como nunca antes."}
      />
      
      <main>
        <Separator className="bg-border/20" />
        <section id="features" className="container mx-auto py-16 sm:py-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">O Primeiro Streaming de Bolões da América Latina</h2>
                <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">Aqui, a emoção do futebol encontra a facilidade do streaming. Escolha, aposte e torça.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                {features.map(feature => (
                    <div key={feature.title} className="flex flex-col items-center text-center">
                        {feature.icon}
                        <h3 className="text-xl font-semibold mt-6">{feature.title}</h3>
                        <p className="text-muted-foreground mt-2 leading-relaxed">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
        <Separator className="bg-border/20" />

        <section id="boloes" className="container mx-auto py-16 sm:py-24">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Catálogo de Jogos</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">Seu próximo grande prêmio está a um clique de distância. Escolha um jogo e dê seu palpite.</p>
            </div>
            
             {loading ? renderCategorySkeletons() : 
               categories.length > 0 ? (
                <div className="space-y-12">
                    {categories.map((category) => (
                        <CategoryShelf key={category.id} category={category} />
                    ))}
                </div>
              ) : (
                <div className="text-center bg-muted/20 border-2 border-dashed border-border/30 rounded-lg py-20 mt-8">
                    <h3 className="text-2xl font-bold">Nenhum bolão disponível no momento.</h3>
                    <p className="text-muted-foreground mt-2">Fique de olho! Novas competições em breve.</p>
                </div>
              )}
        </section>

        <Separator className="bg-border/20" />
        <section id="faq" className="container mx-auto max-w-4xl py-16 sm:py-24">
            <div className="text-center">
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Ainda tem dúvidas? A gente responde.</h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">Sem letras miúdas. Tudo o que você precisa saber para apostar com confiança e segurança.</p>
            </div>
            
            <div className="relative my-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar nas perguntas..." 
                className="pl-9"
                value={faqSearchTerm}
                onChange={(e) => setFaqSearchTerm(e.target.value)}
              />
            </div>
            
            {Object.keys(filteredFaqData).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(filteredFaqData).map(([category, faqs]) => (
                  <div key={category}>
                    <h3 className="text-xl font-semibold mb-4 text-primary">{category}</h3>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`${category}-item-${index}`} key={index}>
                                <AccordionTrigger className="text-lg text-left hover:no-underline">{faq.question}</AccordionTrigger>
                                <AccordionContent className="text-base text-muted-foreground pb-4">{faq.answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-10">
                Nenhuma pergunta encontrada para sua busca.
              </div>
            )}
        </section>
      </main>

      <footer className="border-t border-border/20 bg-muted/50">
          <div className="container mx-auto text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">
                © {new Date().getFullYear()} ChuteFlix. Todos os direitos reservados.
            </p>
            <div className="flex justify-center gap-6 text-sm">
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Termos de Uso</Link>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Política de Privacidade</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contato</Link>
            </div>
          </div>
      </footer>
    </div>
  )
}

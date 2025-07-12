import Link from 'next/link';
import { BolaoCard } from "@/components/bolao-card";
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { boloes } from "@/lib/data";
import type { Bolao } from "@/types";
import { ArrowRight, Award, Tv, Users } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const featureData = [
  {
    icon: <Tv className="w-10 h-10 text-primary" />,
    title: "Participe de Onde Quiser",
    description: "Acesse os bolões no seu computador, TV, celular ou tablet.",
  },
  {
    icon: <Award className="w-10 h-10 text-primary" />,
    title: "Prêmios em Dinheiro",
    description: "Acerte os palpites e ganhe prêmios reais, pagos com segurança via PIX.",
  },
  {
    icon: <Users className="w-10 h-10 text-primary" />,
    title: "Crie Bolões com Amigos",
    description: "Desafie seus amigos em bolões privados e mostre quem entende mais de futebol.",
  },
];

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
    answer: "Sim! Levamos a segurança a sério. Utilizamos as melhores práticas de proteção de dados e transações seguras para garantir que sua experiência e seus prêmios estejam sempre protegidos."
  }
]

export default function HomePage() {
  const activeBoloes = boloes.filter(b => new Date() < b.matchDate && b.status === 'Aberto');

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-sm">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
          </Link>
          <div className="flex items-center space-x-4">
             <Button asChild variant="ghost" className="text-white hover:bg-gray-800 hover:text-white">
                <Link href="/login">Entrar</Link>
            </Button>
             <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md">
                <Link href="/register">Cadastre-se</Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 border-b-8 border-gray-900 flex flex-col items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at center, rgba(38, 38, 38, 0.5) 0%, rgba(0,0,0,1) 70%)' }}
        >
          <div className="container relative">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Bolões, prêmios e muita emoção.
            </h1>
            <h2 className="mt-4 text-2xl font-semibold sm:text-3xl md:text-4xl text-gray-300">Sem limites.</h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-400">
              Pronto para participar? Cadastre-se agora e comece a dar seus palpites.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold rounded-md px-10 py-6 text-lg">
                <Link href="/register">
                  Quero começar <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black">
          <div className="container mx-auto text-center">
             <h2 className="text-3xl font-bold mb-4 sm:text-4xl md:text-5xl">
              A maior plataforma de bolões da América Latina
            </h2>
            <p className="text-lg text-gray-400 mb-12 max-w-3xl mx-auto">Tudo o que você precisa para se divertir e competir, em um só lugar.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {featureData.map((feature, index) => (
                <div key={index} className="flex flex-col items-center">
                  {feature.icon}
                  <h3 className="mt-6 text-xl font-bold">{feature.title}</h3>
                  <p className="mt-2 text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Boloes em Destaque Section */}
        <section className="py-20 bg-gray-950 border-y-8 border-gray-900">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center sm:text-4xl">
              Bolões em Destaque
            </h2>
            {activeBoloes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {activeBoloes.map((bolao: Bolao) => (
                  <BolaoCard key={bolao.id} bolao={bolao} isAuthenticated={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-black rounded-lg border-2 border-dashed border-gray-700">
                <p className="text-xl font-semibold text-gray-400">Nenhum bolão em destaque no momento.</p>
                <p className="mt-2 text-gray-500">Fique de olho! Novas oportunidades em breve.</p>
              </div>
            )}
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-black">
          <div className="container max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center sm:text-4xl">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                 <AccordionItem key={index} value={`item-${index}`} className="bg-gray-900 mb-2 rounded-lg border-none">
                  <AccordionTrigger className="p-6 text-lg hover:no-underline text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="p-6 pt-0 text-gray-400 text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-black border-t-2 border-gray-900">
        <div className="container text-center text-sm text-gray-500">
          <p>ChuteFlix é um produto fictício para fins de demonstração.</p>
          <p className="mt-2">© {new Date().getFullYear()} ChuteFlix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

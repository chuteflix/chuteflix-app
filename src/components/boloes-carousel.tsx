
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { BolaoCard } from "@/components/bolao-card"
import { Bolao } from "@/types" // Importa a interface Bolao do types
// As importações de Team e Championship não são mais necessárias aqui se Bolao já as contém

interface BoloesCarouselProps {
  // title: string // Removido, pois não está sendo usado no componente atual do BoloesCarousel
  boloes: Bolao[] // Agora espera um array de objetos Bolao completos
}

export function BoloesCarousel({ title, boloes }: BoloesCarouselProps) {
  if (boloes.length === 0) return null

  return (
    <section className="mb-12">
      {/* O título da categoria já é renderizado em CategoryShelf, então esta prop de título não é mais necessária aqui */}
      {/* <h2 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">
        {title}
      </h2> */}
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="p-1">
          {boloes.map(bolao => (
            <CarouselItem key={bolao.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
              <Link href={`/boloes/${bolao.id}`} className="block h-full hover:scale-[1.02] transition-transform duration-200">
                <div className="p-1 h-full">
                  <BolaoCard 
                    bolao={bolao}
                    // teamA={bolao.teamADetails} // Removido: BolaoCard agora usa bolao.homeTeam
                    // teamB={bolao.teamBDetails} // Removido: BolaoCard agora usa bolao.awayTeam
                    // championship={bolao.championshipDetails} // Removido: Não é necessário para BolaoCard
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  )
}

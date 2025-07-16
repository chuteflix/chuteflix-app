
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { BolaoCard } from "@/components/bolao-card"
import { Bolao } from "@/services/boloes"
import { Team } from "@/services/teams"
import { Championship } from "@/services/championships"

type BolaoComDetalhes = Bolao & {
  teamADetails?: Team;
  teamBDetails?: Team;
  championshipDetails?: Championship;
};

interface BoloesCarouselProps {
  title: string
  boloes: BolaoComDetalhes[]
}

export function BoloesCarousel({ title, boloes }: BoloesCarouselProps) {
  if (boloes.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4">
        {title}
      </h2>
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
                    teamA={bolao.teamADetails}
                    teamB={bolao.teamBDetails}
                    championship={bolao.championshipDetails}
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

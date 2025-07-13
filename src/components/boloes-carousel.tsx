
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

interface BoloesCarouselProps {
  title: string
  boloes: Bolao[]
  teams: Team[]
  championships: Championship[]
}

export function BoloesCarousel({ title, boloes, teams, championships }: BoloesCarouselProps) {
  if (boloes.length === 0) return null

  const findTeam = (id: string) => teams.find(t => t.id === id)
  const findChampionship = (id: string) => championships.find(c => c.id === id)

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
        <CarouselContent className="-ml-2">
          {boloes.map(bolao => (
            <CarouselItem key={bolao.id} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-2">
              <Link href={`/boloes/${bolao.id}`} className="block hover:scale-[1.02] transition-transform duration-200">
                <div className="p-1">
                  <BolaoCard 
                    bolao={bolao}
                    teamA={findTeam(bolao.teamAId)}
                    teamB={findTeam(bolao.teamBId)}
                    championship={findChampionship(bolao.championshipId)}
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

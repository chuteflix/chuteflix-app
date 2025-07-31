
import Link from "next/link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { BolaoCard } from "@/components/bolao-card"
import { Bolao } from "@/types"

interface BoloesCarouselProps {
  boloes: Bolao[]
}

export function BoloesCarousel({ boloes }: BoloesCarouselProps) {
  if (boloes.length === 0) return null

  return (
    <section className="mb-12">
      <Carousel
        opts={{
          align: "start",
          loop: boloes.length > 1, 
        }}
        className="w-full relative"
      >
        <CarouselContent className="-ml-2">
          {boloes.map(bolao => (
            <CarouselItem key={bolao.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
              <Link 
                href={`/boloes/${bolao.id}`} 
                className="block h-full transition-transform duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.99]"
              >
                <div className="h-full">
                  <BolaoCard 
                    bolao={bolao}
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {boloes.length > 3 && (
            <>
                <CarouselPrevious className="absolute left-[-10px] top-1/2 -translate-y-1/2 z-10 h-8 w-8
                                            md:left-[-16px] md:h-10 md:w-10
                                            bg-background/80 hover:bg-background border-2 border-primary text-primary hover:text-white hover:bg-primary" />
                <CarouselNext className="absolute right-[-10px] top-1/2 -translate-y-1/2 z-10 h-8 w-8
                                           md:right-[-16px] md:h-10 md:w-10
                                           bg-background/80 hover:bg-background border-2 border-primary text-primary hover:text-white hover:bg-primary" />
            </>
        )}
      </Carousel>
    </section>
  )
}

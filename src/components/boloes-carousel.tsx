
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
          loop: boloes.length > 1, // Ativa o loop apenas se houver mais de um item
        }}
        className="w-full relative" // Adicionado `relative` para posicionar as setas
      >
        <CarouselContent className="p-1">
          {boloes.map(bolao => (
            <CarouselItem key={bolao.id} className="basis-full md:basis-1/2 lg:basis-1/3 xl:basis-1/4 p-2">
              <Link 
                href={`/boloes/${bolao.id}`} 
                className="block h-full hover:scale-[1.02] transition-transform duration-200 
                           active:scale-[0.98] active:border-primary-dark active:shadow-md" // Adicionado feedback visual ao toque
              >
                <div className="p-1 h-full">
                  <BolaoCard 
                    bolao={bolao}
                  />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Renderiza as setas condicionalmente se houver mais de um bolão */}
        {boloes.length > 1 && (
            <>
                {/* As setas agora são visíveis em todas as telas, com ajuste de posição para mobile */}
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

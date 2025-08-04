
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Category } from "@/services/categories"
import { BolaoCard } from "./bolao-card"
import Link from "next/link"

interface CategoryShelfProps {
  category: Category
}

export function CategoryShelf({ category }: CategoryShelfProps) {
  if (category.boloes.length === 0) {
    return null
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {category.boloes.map(bolao => (
            <CarouselItem key={bolao.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <BolaoCard bolao={bolao} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  )
}

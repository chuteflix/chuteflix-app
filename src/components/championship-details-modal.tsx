
"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Championship } from "@/services/championships"
import { Badge } from "@/components/ui/badge"

interface ChampionshipDetailsModalProps {
  championship: Championship
  children: React.ReactNode
}

export function ChampionshipDetailsModal({
  championship,
  children,
}: ChampionshipDetailsModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Campeonato</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-semibold">Nome</h3>
            <p>{championship.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Tipo de Competição</h3>
            <p>{championship.competitionType === 'national' ? 'Nacional/Brasileiro' : 'Internacional'}</p>
          </div>

          {championship.competitionType === 'national' ? (
            <>
              <div>
                <h3 className="font-semibold">Tipo</h3>
                <Badge variant={championship.type === 'professional' ? 'default' : 'secondary'}>
                  {championship.type === 'professional' ? 'Profissional' : 'Amador'}
                </Badge>
              </div>
              {championship.type === 'professional' && (
                <>
                  <div>
                    <h3 className="font-semibold">Projeção</h3>
                    <p>{championship.scope}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Série</h3>
                    <p>{championship.series}</p>
                  </div>
                </>
              )}
              {championship.state && (
                <div>
                  <h3 className="font-semibold">Estado</h3>
                  <p>{championship.state}</p>
                </div>
              )}
              {championship.city && (
                <div>
                  <h3 className="font-semibold">Cidade</h3>
                  <p>{championship.city}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div>
                <h3 className="font-semibold">Continente</h3>
                <p>{championship.continent}</p>
              </div>
              <div>
                <h3 className="font-semibold">País</h3>
                <p>{championship.country}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Palpite } from "@/services/palpites"
import { UserProfile } from "@/services/users"

interface PalpiteCardProps {
  palpite: Palpite & { user?: UserProfile }
}

export function PalpiteCard({ palpite }: PalpiteCardProps) {
  const getFullName = (user: UserProfile) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.displayName || "N/A"
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-start space-x-4">
        <Avatar>
          <AvatarImage src={palpite.user?.photoURL} />
          <AvatarFallback>
            {palpite.user?.firstName
              ? palpite.user.firstName.charAt(0)
              : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <div className="flex items-center space-x-2">
            <p className="font-semibold text-sm">
              {palpite.user ? getFullName(palpite.user) : "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground">
              chutou o placar de {palpite.scoreTeam1} a {palpite.scoreTeam2}
            </p>
          </div>
          {palpite.comment && (
            <p className="text-sm text-muted-foreground mt-1">
              "{palpite.comment}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

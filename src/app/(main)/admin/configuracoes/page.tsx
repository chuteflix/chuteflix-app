
"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">
        Configurações
      </h1>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Geral</CardTitle>
            <CardDescription>
              Configurações gerais do aplicativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="app-name">Nome do Aplicativo</Label>
                <Input id="app-name" defaultValue="ChuteFlix" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="app-theme">Tema</Label>
                <Select>
                  <SelectTrigger id="app-theme">
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button>Salvar</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

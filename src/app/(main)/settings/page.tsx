
"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { getUserProfile, updateUserProfile } from "@/services/users"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [pixKeyType, setPixKeyType] = useState("cpf")
  const [randomPixKey, setRandomPixKey] = useState("")
  const [savedPixKey, setSavedPixKey] = useState("")
  const [savedPixKeyType, setSavedPixKeyType] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const [userData, setUserData] = useState({
    cpf: "Não informado",
    email: "Não informado",
    phone: "Não informado",
  })

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        setIsLoading(true)
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setUserData({
            cpf: profile.cpf || "Não informado",
            email: profile.email || "Não informado",
            phone: profile.phone || "Não informado",
          })
          if (profile.pixKey && profile.pixKeyType) {
            setSavedPixKey(profile.pixKey)
            setSavedPixKeyType(profile.pixKeyType)
          }
        }
        setIsLoading(false)
      }
    }
    fetchUserData()
  }, [user])

  const handleSaveKey = async () => {
    if (!user) return

    let keyToSave = ""
    let typeToSave = ""

    switch (pixKeyType) {
      case "cpf":
        keyToSave = userData.cpf;
        typeToSave = "CPF";
        break
      case "email":
        keyToSave = userData.email;
        typeToSave = "E-mail";
        break
      case "phone":
        keyToSave = userData.phone;
        typeToSave = "Telefone";
        break
      case "random":
        keyToSave = randomPixKey
        typeToSave = "Chave Aleatória"
        break
      default:
        return
    }

    if (keyToSave && keyToSave !== "Não informado") {
      try {
        await updateUserProfile(user.uid, { pixKey: keyToSave, pixKeyType: typeToSave })
        setSavedPixKey(keyToSave)
        setSavedPixKeyType(typeToSave)
        toast({
          title: "Sucesso!",
          description: "Sua chave PIX foi salva.",
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível salvar sua chave PIX.",
          variant: "destructive",
        })
      }
    } else {
       toast({
          title: "Atenção",
          description: "Selecione uma chave válida ou preencha a chave aleatória.",
          variant: "destructive",
        })
    }
  }

  const handleDeleteKey = async () => {
    if (!user) return

    try {
      await updateUserProfile(user.uid, { pixKey: "", pixKeyType: "" })
      setSavedPixKey("")
      setSavedPixKeyType("")
      toast({
        title: "Sucesso!",
        description: "Sua chave PIX foi removida.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover sua chave PIX.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Chave PIX</h1>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Nova Chave PIX</CardTitle>
            <CardDescription>
              Selecione ou cadastre a chave PIX que você usará para receber seus
              prêmios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={pixKeyType}
              onValueChange={setPixKeyType}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { type: "cpf", label: "CPF", value: userData.cpf },
                { type: "email", label: "E-mail", value: userData.email },
                { type: "phone", label: "Telefone", value: userData.phone },
                { type: "random", label: "Chave Aleatória" },
              ].map(({ type, label, value }) => (
                <div key={type}>
                  <RadioGroupItem
                    value={type}
                    id={type}
                    className="peer sr-only"
                    disabled={!value || value === "Não informado"}
                  />
                  <Label
                    htmlFor={type}
                    className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 ${
                      !value || value === "Não informado"
                        ? "cursor-not-allowed opacity-50"
                        : "hover:bg-accent hover:text-accent-foreground"
                    } peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary`}
                  >
                    <span className="font-semibold">{label}</span>
                    {value && value !== "Não informado" && <span className="text-sm text-muted-foreground mt-1">{value}</span>}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {pixKeyType === "random" && (
              <div className="grid gap-2 mt-4">
                <Label htmlFor="random-pix-key">Chave Aleatória</Label>
                <Input
                  id="random-pix-key"
                  placeholder="Cole sua chave aleatória aqui"
                  value={randomPixKey}
                  onChange={e => setRandomPixKey(e.target.value)}
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button onClick={handleSaveKey}>Salvar Chave PIX</Button>
          </CardFooter>
        </Card>

        {savedPixKey && (
          <Card>
            <CardHeader>
              <CardTitle>Chave PIX Cadastrada</CardTitle>
              <CardDescription>
                Esta é a chave PIX que será usada para o pagamento dos seus
                prêmios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <div>
                  <p className="text-sm font-medium">{savedPixKeyType}</p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {savedPixKey}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDeleteKey}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}


"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorInputProps extends InputProps {
  label: string;
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, value, onChange, id, ...props }, ref) => {
    
    // Garante que o valor exibido seja sempre uma string, evitando erros com 'null' ou 'undefined'
    const displayValue = typeof value === 'string' ? value : '';

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2 border rounded-md pr-2">
            {/* O seletor de cores atua como um auxiliar visual */}
            <Input
              type="color"
              id={`${id}-picker`}
              className="w-12 h-10 p-1 border-none cursor-pointer bg-transparent"
              // O seletor de cor precisa de um valor hexadecimal válido para funcionar
              value={displayValue.startsWith('#') ? displayValue : '#000000'}
              onChange={onChange} 
            />
            {/* O input de texto é a fonte principal de dados para o formulário */}
            <Input
                ref={ref} 
                id={id}
                type="text"
                value={displayValue}
                onChange={onChange} 
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none uppercase"
                placeholder="#RRGGBB"
                {...props}
            />
        </div>
      </div>
    )
  }
)
ColorInput.displayName = "ColorInput"

export { ColorInput }

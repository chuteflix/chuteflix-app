
"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorInputProps extends InputProps {
  label: string;
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, value, onChange, ...props }, ref) => {
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Garante que o evento onChange seja propagado para o react-hook-form
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={props.id}>{label}</Label>
        <div className="flex items-center gap-2 border rounded-md pr-2">
            <Input
              type="color"
              className="w-12 h-10 p-1 border-none cursor-pointer bg-transparent"
              value={value || '#000000'}
              onChange={onChange} // O seletor de cores atualiza o formulário
              {...props}
            />
            <Input
                ref={ref} // A referência agora é para o input de texto para digitação manual
                type="text"
                value={value || ''}
                onChange={handleTextChange} // O texto também atualiza o formulário
                className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none uppercase"
                placeholder="#RRGGBB"
            />
        </div>
      </div>
    )
  }
)
ColorInput.displayName = "ColorInput"

export { ColorInput }

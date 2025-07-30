
"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorInputProps extends InputProps {
  label: string;
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, value, onChange, id, ...props }, ref) => {

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2 border rounded-md pr-2">
            {/* O seletor de cores atua como um botão para alterar o estado */}
            <Input
              type="color"
              id={`${id}-picker`}
              className="w-12 h-10 p-1 border-none cursor-pointer bg-transparent"
              value={String(value) || '#000000'}
              onChange={onChange} 
            />
            {/* O input de texto é a fonte de verdade para o react-hook-form */}
            <Input
                ref={ref} 
                id={id}
                type="text"
                value={String(value) || ''}
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

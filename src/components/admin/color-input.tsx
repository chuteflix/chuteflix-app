
"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorInputProps extends InputProps {
  label: string;
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, value, onChange, id, ...props }, ref) => {
    
    // Garante que o valor seja sempre uma string para os inputs controlados.
    const stringValue = typeof value === 'string' ? value : '';

    return (
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2 border rounded-md pr-2 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          {/* O seletor de cores, que também dispara o onChange do formulário */}
          <Input
            type="color"
            aria-label={`${label} color picker`}
            className="w-12 h-10 p-1 border-none cursor-pointer bg-transparent"
            // Garante que o seletor sempre tenha um valor hexadecimal válido
            value={stringValue.match(/^#[0-9a-fA-F]{6}$/) ? stringValue : '#000000'}
            onChange={onChange}
          />
          {/* O input de texto, que é a fonte principal e segura para o formulário */}
          <Input
            ref={ref} // Ref do react-hook-form para registro
            id={id}
            type="text"
            className="flex-1 bg-transparent border-none h-9 focus:ring-0 focus:outline-none uppercase"
            placeholder="#FFFFFF"
            {...props}
            value={stringValue}
            onChange={onChange} // Dispara o onChange do formulário a cada alteração
          />
        </div>
      </div>
    );
  }
);
ColorInput.displayName = "ColorInput";

export { ColorInput };

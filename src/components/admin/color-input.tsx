
"use client"

import * as React from "react"
import { Input, InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorInputProps extends InputProps {
  label: string;
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2">
        <Label htmlFor={props.id} className="w-20">{label}</Label>
        <div className="relative flex items-center">
            <Input
            type="color"
            className="w-12 h-10 p-1 border-none cursor-pointer"
            ref={ref}
            {...props}
            />
            <span className="ml-2 uppercase">{props.value}</span>
        </div>
      </div>
    )
  }
)
ColorInput.displayName = "ColorInput"

export { ColorInput }

'use client';

import { Controller, Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorInputProps {
  name: string;
  label: string;
  control: Control<any>;
  error?: string;
}

export function ColorInput({ name, label, control, error }: ColorInputProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="flex items-center gap-2">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <>
              <Input
                id={name}
                type="color"
                className="w-12 h-10 p-1"
                {...field}
              />
              <Input
                type="text"
                className="flex-1"
                placeholder="#000000"
                {...field}
              />
            </>
          )}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

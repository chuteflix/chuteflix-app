import { Goal } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Goal className="h-6 w-6 text-primary" />
      <h1 className="text-lg font-bold text-white">ChuteFlix</h1>
    </div>
  );
}

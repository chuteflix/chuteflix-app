
import { getSettings } from "@/services/settings";
import { Settings } from "@/types";

interface AuthLayoutProps {
  children: React.ReactNode;
  settings: Settings | null;
}

// Este é um layout para as páginas de autenticação.
// Não precisa do AuthProvider aqui, pois o RootLayout já tem.
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
        {/* As páginas de auth não precisam de um header complexo, 
            mas o logo pode ser mostrado na própria página de login/registro */}
        {children}
    </div>
  );
}

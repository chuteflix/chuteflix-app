
import { getSettings } from "@/services/settings";
import { Settings } from "@/types";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
        {children}
    </div>
  );
}

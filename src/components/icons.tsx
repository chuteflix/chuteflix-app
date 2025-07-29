
import * as React from "react";
import Image from "next/image";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  logoUrl?: string | null;
}

export const Logo: React.FC<LogoProps> = ({ logoUrl, ...props }) => {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt="Logo"
        width={128} // Largura de referência para proporção
        height={32}  // Altura de referência para proporção
        className="h-8 w-auto" // Controla o tamanho final na tela
        priority // Ajuda a carregar o logo mais rápido
      />
    );
  }

  // Fallback para o SVG se não houver logoUrl
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo"
      {...props}
    >
      <path
        d="M21.3333 4H10.6667C6.98477 4 4 6.98477 4 10.6667V21.3333C4 25.0152 6.98477 28 10.6667 28H21.3333C25.0152 28 28 25.0152 28 21.3333V10.6667C28 6.98477 25.0152 4 21.3333 4Z"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12V20"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16H20"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

'use client';

import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';

const DynamicStyler = () => {
  const { settings, loading } = useAuth();

  useEffect(() => {
    if (loading || !settings?.colors) {
      return;
    }

    const {
      primary,
      primaryForeground,
      secondary,
      secondaryForeground,
      accent,
      accentForeground,
      background,
      foreground,
      card,
      cardForeground,
      border,
      input,
      ring,
    } = settings.colors;

    const css = `
      :root {
        --background: ${background};
        --foreground: ${foreground};
        --card: ${card};
        --card-foreground: ${cardForeground};
        --primary: ${primary};
        --primary-foreground: ${primaryForeground};
        --secondary: ${secondary};
        --secondary-foreground: ${secondaryForeground};
        --accent: ${accent};
        --accent-foreground: ${accentForeground};
        --border: ${border};
        --input: ${input};
        --ring: ${ring};
      }
    `;

    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [settings, loading]);

  return null;
};

export default DynamicStyler;

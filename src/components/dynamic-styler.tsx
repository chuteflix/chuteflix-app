
'use client';

import { useAuth } from '@/context/auth-context';
import { useEffect } from 'react';
import { hexToHSL } from '@/lib/colors'; // Importa a função de conversão

const DynamicStyler = () => {
  const { settings, loading } = useAuth();

  useEffect(() => {
    if (loading || !settings) {
      return;
    }

    const root = document.documentElement;

    // Atualiza variáveis CSS para cores
    if (settings.colors) {
      const {
        primary,
        secondary,
        accent,
        background,
        text: foreground,
      } = settings.colors;

      if (primary) root.style.setProperty('--primary', hexToHSL(primary));
      if (secondary) root.style.setProperty('--secondary', hexToHSL(secondary));
      if (accent) root.style.setProperty('--accent', hexToHSL(accent));
      if (background) root.style.setProperty('--background', hexToHSL(background));
      if (foreground) root.style.setProperty('--foreground', hexToHSL(foreground));
    }

    // Atualiza o Favicon
    if (settings.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }

    // Atualiza o título da página
    if (settings.appName) {
      document.title = settings.appName;
    }

  }, [settings, loading]);

  return null;
};

export default DynamicStyler;

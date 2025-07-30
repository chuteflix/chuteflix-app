
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
      secondary,
      accent,
      background,
      text: foreground,
    } = settings.colors;

    const root = document.documentElement;

    if (primary) root.style.setProperty('--primary', primary);
    if (secondary) root.style.setProperty('--secondary', secondary);
    if (accent) root.style.setProperty('--accent', accent);
    if (background) root.style.setProperty('--background', background);
    if (foreground) root.style.setProperty('--foreground', foreground);

  }, [settings, loading]);

  return null;
};

export default DynamicStyler;

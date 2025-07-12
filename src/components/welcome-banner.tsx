"use client";

import { useState, useEffect } from 'react';

export function WelcomeBanner() {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem('userFirstName');
    if (name) {
      setFirstName(name);
      setIsVisible(true);
    }
  }, []);

  if (!isVisible || !firstName) {
    return null;
  }

  return (
    <div className="text-sm font-medium text-primary">
      Olá, {firstName}!
    </div>
  );
}

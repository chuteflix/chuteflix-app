
"use client";

import { LayoutClient } from './layout-client';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
      <LayoutClient>{children}</LayoutClient>
  );
}

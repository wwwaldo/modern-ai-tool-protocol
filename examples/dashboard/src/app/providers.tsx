'use client';

import { ReactNode } from 'react';
import { EventBusProvider } from '@/context/EventBusContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <EventBusProvider>
      {children}
    </EventBusProvider>
  );
}

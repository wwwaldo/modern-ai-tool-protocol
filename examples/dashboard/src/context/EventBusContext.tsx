'use client';

import { createContext, useContext, ReactNode } from 'react';
import { EventBus } from 'modern-ai-tool-protocol';

// Create a simple event bus implementation
class SimpleEventBus implements EventBus {
  private handlers: Record<string, Array<(event: any) => void>> = {};

  emit<T extends string>(type: T, payload: any): void {
    const event = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      source: 'tool',
      type,
      payload
    };

    const handlers = this.handlers[type] || [];
    handlers.forEach(handler => handler(event));
  }

  on<T extends string>(type: T, handler: (event: any) => void): () => void {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler);
    return () => {
      this.handlers[type] = this.handlers[type].filter(h => h !== handler);
    };
  }

  once<T extends string>(type: T, handler: (event: any) => void): () => void {
    const unsubscribe = this.on(type, (event) => {
      handler(event);
      unsubscribe();
    });
    return unsubscribe;
  }
}

const EventBusContext = createContext<EventBus>(new SimpleEventBus());

export function EventBusProvider({ children }: { children: ReactNode }) {
  return (
    <EventBusContext.Provider value={new SimpleEventBus()}>
      {children}
    </EventBusContext.Provider>
  );
}

export function useEventBus() {
  return useContext(EventBusContext);
}

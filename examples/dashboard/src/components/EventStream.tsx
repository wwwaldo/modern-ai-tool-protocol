'use client';

import { Card, Title, Text } from "@tremor/react";
import { useEffect, useState } from "react";
import { useEventBus } from "@/context/EventBusContext";

interface Event {
  id: string;
  timestamp: number;
  type: string;
  data: any;
}

export function EventStream() {
  const eventBus = useEventBus();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const unsubscribeProgress = eventBus.on('tool:execution:progress', (event) => {
      setEvents(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type: 'progress',
        data: event
      }]);
    });

    const unsubscribeError = eventBus.on('tool:execution:error', (event) => {
      setEvents(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        type: 'error',
        data: event
      }]);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeError();
    };
  }, [eventBus]);

  return (
    <Card>
      <Title>Event Stream</Title>
      <Text>Real-time events from tool executions</Text>

      <div className="mt-4 space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className={`p-3 rounded ${
              event.type === 'error' ? 'bg-red-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between">
              <span className="font-mono">
                {event.type === 'progress' ? '✨' : '❌'} {event.type}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <pre className="mt-2 text-sm overflow-x-auto">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No events yet. Try running a tool!
          </div>
        )}
      </div>
    </Card>
  );
}

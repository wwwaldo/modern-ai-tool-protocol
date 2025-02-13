'use client';

import { Card, Title, Text, Button, NumberInput } from "@tremor/react";
import { useState } from "react";
import numberStreamTool from "../../../real-world/number-stream";
import { useEventBus } from "@/context/EventBusContext";

export function ToolExecutor() {
  const eventBus = useEventBus();
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [duration, setDuration] = useState(10);
  const [isRunning, setIsRunning] = useState(false);

  const executeStream = async () => {
    setIsRunning(true);
    try {
      const stream = numberStreamTool.execute({ min, max, duration });
      
      for await (const result of stream) {
        if (result.status === 'success') {
          eventBus.emit('tool:execution:progress', {
            tool: 'number-stream',
            result: result.data
          });
        }
      }
    } catch (error) {
      eventBus.emit('tool:execution:error', {
        tool: 'number-stream',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <Title>Tool Executor</Title>
      <Text>Configure and run the number stream tool</Text>

      <div className="mt-4 space-y-4">
        <div className="flex gap-4">
          <NumberInput
            placeholder="Min"
            value={min}
            onValueChange={setMin}
            min={0}
            max={max - 1}
          />
          <NumberInput
            placeholder="Max"
            value={max}
            onValueChange={setMax}
            min={min + 1}
          />
          <NumberInput
            placeholder="Duration (seconds)"
            value={duration}
            onValueChange={setDuration}
            min={1}
            max={60}
          />
        </div>

        <Button
          onClick={executeStream}
          disabled={isRunning}
          className="mt-4"
        >
          {isRunning ? 'Generating Numbers...' : 'Start Number Stream'}
        </Button>
      </div>
    </Card>
  );
}

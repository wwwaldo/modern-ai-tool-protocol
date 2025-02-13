'use client';

import { Card, Title, Text, Button, NumberInput } from "@tremor/react";
import { useState, useEffect } from "react";
import numberStreamTool from "../../../real-world/number-stream";

export function NumberStream() {
  const [numbers, setNumbers] = useState<Array<{ value: number; timestamp: number }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [duration, setDuration] = useState(10);

  const startStream = async () => {
    setIsRunning(true);
    setNumbers([]);
    
    const stream = numberStreamTool.execute({ min, max, duration });
    
    try {
      for await (const result of stream) {
        if (result.status === 'success') {
          setNumbers(prev => [...prev, {
            value: result.data.currentNumber,
            timestamp: result.data.timestamp
          }]);
        }
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <Title>Number Stream</Title>
      <Text>Watch random numbers being generated in real-time</Text>
      
      <div className="flex gap-4 mt-4">
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
        <Button
          onClick={startStream}
          disabled={isRunning}
        >
          {isRunning ? 'Generating...' : 'Start Stream'}
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {numbers.map((num, i) => (
          <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span className="font-mono text-lg">{num.value}</span>
            <span className="text-sm text-gray-500">
              {new Date(num.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

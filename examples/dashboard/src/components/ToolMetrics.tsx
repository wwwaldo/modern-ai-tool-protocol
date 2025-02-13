import { Card, Title, Text, AreaChart, DonutChart, BarChart, Grid, Metric, Flex } from "@tremor/react";
import { useEventBus } from "@/hooks/useEventBus";
import { useEffect, useState } from "react";

interface Metrics {
  totalExecutions: number;
  successRate: number;
  averageDuration: number;
  totalCost: number;
  executionsByTool: Record<string, number>;
  errorsByType: Record<string, number>;
}

export function ToolMetrics() {
  const [metrics, setMetrics] = useState<Metrics>({
    totalExecutions: 0,
    successRate: 0,
    averageDuration: 0,
    totalCost: 0,
    executionsByTool: {},
    errorsByType: {}
  });

  const eventBus = useEventBus();

  useEffect(() => {
    const handlers: Array<() => void> = [];

    // Track successful executions
    handlers.push(
      eventBus.on('tool.complete', (event) => {
        setMetrics(prev => ({
          ...prev,
          totalExecutions: prev.totalExecutions + 1,
          successRate: ((prev.totalExecutions * prev.successRate + 100) / (prev.totalExecutions + 1)),
          averageDuration: ((prev.averageDuration * prev.totalExecutions + event.payload.duration) / (prev.totalExecutions + 1)),
          totalCost: prev.totalCost + (event.payload.cost || 0),
          executionsByTool: {
            ...prev.executionsByTool,
            [event.payload.toolId]: (prev.executionsByTool[event.payload.toolId] || 0) + 1
          }
        }));
      })
    );

    // Track errors
    handlers.push(
      eventBus.on('tool.error', (event) => {
        setMetrics(prev => ({
          ...prev,
          totalExecutions: prev.totalExecutions + 1,
          successRate: ((prev.totalExecutions * prev.successRate) / (prev.totalExecutions + 1)),
          errorsByType: {
            ...prev.errorsByType,
            [event.payload.error.code]: (prev.errorsByType[event.payload.error.code] || 0) + 1
          }
        }));
      })
    );

    return () => handlers.forEach(h => h());
  }, []);

  // Sample time series data
  const timeData = [
    { time: "9:00", executions: 5 },
    { time: "10:00", executions: 8 },
    { time: "11:00", executions: 12 },
    { time: "12:00", executions: 15 },
    { time: "13:00", executions: 10 },
    { time: "14:00", executions: 13 }
  ];

  return (
    <div className="space-y-6">
      <Grid numItems={2} className="gap-6">
        <Card>
          <Title>Success Rate</Title>
          <Metric>{metrics.successRate.toFixed(1)}%</Metric>
        </Card>
        <Card>
          <Title>Total Cost</Title>
          <Metric>${metrics.totalCost.toFixed(2)}</Metric>
        </Card>
      </Grid>

      <Card>
        <Title>Executions Over Time</Title>
        <AreaChart
          className="mt-4 h-72"
          data={timeData}
          index="time"
          categories={["executions"]}
          colors={["blue"]}
        />
      </Card>

      <Grid numItems={2} className="gap-6">
        <Card>
          <Title>Executions by Tool</Title>
          <DonutChart
            className="mt-4 h-48"
            data={Object.entries(metrics.executionsByTool).map(([name, value]) => ({
              name,
              value
            }))}
            category="value"
            index="name"
          />
        </Card>

        <Card>
          <Title>Errors by Type</Title>
          <BarChart
            className="mt-4 h-48"
            data={Object.entries(metrics.errorsByType).map(([name, value]) => ({
              name,
              value
            }))}
            index="name"
            categories={["value"]}
          />
        </Card>
      </Grid>
    </div>
  );
}

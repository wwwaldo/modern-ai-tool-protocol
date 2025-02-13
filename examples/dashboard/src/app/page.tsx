'use client';

import { Card, Title, Text, Tab, TabList, TabGroup, TabPanel, TabPanels } from "@tremor/react";
import { ToolMetrics } from "@/components/ToolMetrics";
import { EventStream } from "@/components/EventStream";
import { ToolExecutor } from "@/components/ToolExecutor";
import { NumberStream } from "@/components/NumberStream";
import { useState } from "react";

export default function Home() {
  const [selectedView, setSelectedView] = useState(1);

  return (
    <main className="p-12">
      <Title>Modern AI Tool Protocol Dashboard</Title>
      <Text>Monitor and interact with AI tools in real-time</Text>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Tool Execution</Tab>
          <Tab>Event Stream</Tab>
          <Tab>Metrics</Tab>
          <Tab>Number Stream</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <div className="mt-6">
              <ToolExecutor />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <EventStream />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <ToolMetrics />
            </div>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <NumberStream />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
}

// Tool definition that works with our protocol
export interface ToolDefinition {
  name: string;
  type: 'query' | 'mutation';  // Query tools can run in parallel, mutations must be sequential
  description: string;
  input: Record<string, 'string' | 'number' | 'boolean'>;
  output?: Record<string, any>;  // Can be more specific based on tool
  execute: (input: any) => Promise<any>;
  reason?: string;  // Model explains why it's using this tool
}

// OpenAI's format
export interface OpenAIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
    }>;
    required: string[];
  };
}

// Anthropic's format
export interface AnthropicFunction {
  name: string;
  description: string;
  parameters: {
    $schema: string;
    type: 'object';
    properties: Record<string, {
      type: string;
      description?: string;
    }>;
    required: string[];
  };
}

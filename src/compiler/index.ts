import { ToolDefinition, OpenAIFunction, AnthropicFunction } from './types';

export function compileToOpenAI(tool: ToolDefinition): OpenAIFunction {
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      type: 'object',
      properties: Object.entries(tool.input).reduce((acc, [key, type]) => ({
        ...acc,
        [key]: {
          type: type === 'number' ? 'number' : 'string',
          description: `Parameter ${key} of type ${type}`
        }
      }), {}),
      required: Object.keys(tool.input)
    }
  };
}

export function compileToAnthropic(tool: ToolDefinition): AnthropicFunction {
  return {
    name: tool.name,
    description: tool.description,
    parameters: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: Object.entries(tool.input).reduce((acc, [key, type]) => ({
        ...acc,
        [key]: {
          type: type === 'number' ? 'number' : 'string',
          description: `Parameter ${key} of type ${type}`
        }
      }), {}),
      required: Object.keys(tool.input)
    }
  };
}

// Validate a tool works with both formats
export function validateTool(tool: ToolDefinition): boolean {
  try {
    // Basic validation
    if (!tool.name || !tool.description) return false;
    if (!tool.input || Object.keys(tool.input).length === 0) return false;
    if (!tool.execute || typeof tool.execute !== 'function') return false;

    // Compile validation
    const openai = compileToOpenAI(tool);
    const anthropic = compileToAnthropic(tool);

    // Check all inputs are handled
    const inputKeys = Object.keys(tool.input);
    const openaiKeys = Object.keys(openai.parameters.properties);
    const anthropicKeys = Object.keys(anthropic.parameters.properties);

    return (
      inputKeys.every(k => openaiKeys.includes(k)) &&
      inputKeys.every(k => anthropicKeys.includes(k))
    );
  } catch (e) {
    return false;
  }
}

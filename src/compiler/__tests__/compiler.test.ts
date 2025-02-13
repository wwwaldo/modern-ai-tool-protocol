import { compileToOpenAI, compileToAnthropic, validateTool } from '../';
import { getClickableElements, clickElement } from '../../tools/web';

describe('Tool Compiler', () => {
  describe('getClickableElements', () => {
    it('compiles to OpenAI format', () => {
      const openai = compileToOpenAI(getClickableElements);
      expect(openai).toEqual({
        name: 'get_clickable_elements',
        description: 'Get all clickable elements on the current page',
        parameters: {
          type: 'object',
          properties: {
            basedOnSequence: {
              type: 'number',
              description: 'Parameter basedOnSequence of type number'
            }
          },
          required: ['basedOnSequence']
        }
      });
    });

    it('compiles to Anthropic format', () => {
      const anthropic = compileToAnthropic(getClickableElements);
      expect(anthropic).toEqual({
        name: 'get_clickable_elements',
        description: 'Get all clickable elements on the current page',
        parameters: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            basedOnSequence: {
              type: 'number',
              description: 'Parameter basedOnSequence of type number'
            }
          },
          required: ['basedOnSequence']
        }
      });
    });

    it('validates successfully', () => {
      expect(validateTool(getClickableElements)).toBe(true);
    });
  });

  describe('clickElement', () => {
    it('compiles to OpenAI format', () => {
      const openai = compileToOpenAI(clickElement);
      expect(openai).toEqual({
        name: 'click_element',
        description: 'Click a specific element on the page',
        parameters: {
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'Parameter selector of type string'
            },
            basedOnSequence: {
              type: 'number',
              description: 'Parameter basedOnSequence of type number'
            }
          },
          required: ['selector', 'basedOnSequence']
        }
      });
    });

    it('compiles to Anthropic format', () => {
      const anthropic = compileToAnthropic(clickElement);
      expect(anthropic).toEqual({
        name: 'click_element',
        description: 'Click a specific element on the page',
        parameters: {
          $schema: 'https://json-schema.org/draft/2020-12/schema',
          type: 'object',
          properties: {
            selector: {
              type: 'string',
              description: 'Parameter selector of type string'
            },
            basedOnSequence: {
              type: 'number',
              description: 'Parameter basedOnSequence of type number'
            }
          },
          required: ['selector', 'basedOnSequence']
        }
      });
    });

    it('validates successfully', () => {
      expect(validateTool(clickElement)).toBe(true);
    });
  });

  describe('validation', () => {
    it('fails on missing name', () => {
      const badTool = {
        ...getClickableElements,
        name: ''
      };
      expect(validateTool(badTool)).toBe(false);
    });

    it('fails on missing input properties', () => {
      const badTool = {
        ...getClickableElements,
        input: {}
      };
      expect(validateTool(badTool)).toBe(false);
    });
  });
});

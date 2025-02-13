// Mock DOM for testing
import { Frame } from '../types';

// Mock initial page state
export const mockPage: Frame = {
  sequence: 1,
  content: '<div><button>Click me</button><a href="#">Link</a></div>',
  type: 'full'
};

// Mock element query
export function queryElements(content: string) {
  // Very simple mock implementation
  return [
    {
      selector: 'button',
      text: 'Click me',
      type: 'button',
      enabled: true
    },
    {
      selector: 'a',
      text: 'Link',
      type: 'link',
      enabled: true
    }
  ];
}

export interface Frame {
  sequence: number;
  content: string;
  type: 'full' | 'diff' | 'error';
  baseSequence?: number;
}

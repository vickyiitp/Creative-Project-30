export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  label: string;
  type: 'function' | 'variable' | 'class' | 'interface';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EdgeData {
  id: string;
  sourceId: string;
  targetId: string;
  isIntersecting: boolean;
}

export interface GameState {
  level: number;
  nodes: NodeData[];
  edges: EdgeData[];
  isSolved: boolean;
}
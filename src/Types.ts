export interface Node {
  value: number;
  left?: Node | null;
  right?: Node | null;
  state: string;
  x: number;
  y: number;
}

export interface Step {
  value: number;
  state: string;
}

export enum SortSpeeds {
  FAST = "Fast",
  MEDIUM = "Medium",
  SLOW = "Slow",
}

export enum TraversalTypes {
  IN_ORDER = "InOrder",
  PRE_ORDER = "PreOrder",
  POST_ORDER = "PostOrder",
  BFS = "Bfs",
}

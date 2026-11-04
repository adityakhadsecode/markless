export type BrandColor = 'cobalt' | 'mint' | 'lilac';

export interface AgentConfig {
  id: number;
  name: string;
  colorKey: BrandColor;
  color: string;
}

export const SWARM_AGENTS: AgentConfig[] = [
  // 4 Cobalt Blue (#2563eb)
  { id: 0, name: 'Ada', colorKey: 'cobalt', color: '#2563eb' },
  { id: 1, name: 'Hopper', colorKey: 'cobalt', color: '#2563eb' },
  { id: 2, name: 'Lovelace', colorKey: 'cobalt', color: '#2563eb' },
  { id: 3, name: 'Torvalds', colorKey: 'cobalt', color: '#2563eb' },
  
  // 4 Mint Emerald (#059669)
  { id: 4, name: 'Turing', colorKey: 'mint', color: '#059669' },
  { id: 5, name: 'Pascal', colorKey: 'mint', color: '#059669' },
  { id: 6, name: 'Dijkstra', colorKey: 'mint', color: '#059669' },
  { id: 7, name: 'Ritchie', colorKey: 'mint', color: '#059669' },
  
  // 4 Lilac Purple (#7c3aed)
  { id: 8, name: 'Shannon', colorKey: 'lilac', color: '#7c3aed' },
  { id: 9, name: 'Knuth', colorKey: 'lilac', color: '#7c3aed' },
  { id: 10, name: 'Hamilton', colorKey: 'lilac', color: '#7c3aed' },
  { id: 11, name: 'Wozniak', colorKey: 'lilac', color: '#7c3aed' },
];

export type BlockState = 'empty' | 'mark' | 'rough' | 'done';

export interface BlockMeta {
  id: string;
  sectionId: string;
  element: HTMLElement | null;
  state: BlockState;
  jsx: string;
  preferredAgent?: string;
  isHeadline?: boolean;
  headlineText?: string;
  assignedAgent?: AgentConfig;
  marqueeRect?: { left: number; top: number; width: number; height: number };
}

export interface CursorInstance {
  id: number;
  name: string;
  color: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  bow: number;
  mode: 'idle' | 'travel' | 'mark' | 'typing';
  jobStartTime: number;
  jobDuration: number;
  assignedBlockId?: string;
  wanderAngle: number;
  wanderSpeed: number;
  wanderRadiusX: number;
  wanderRadiusY: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  agentColor: string;
  action: string;
  blockId?: string;
}

export interface SectionMeta {
  id: string;
  element: HTMLElement | null;
  blockIds: string[];
  isStarted: boolean;
  isDone: boolean;
}

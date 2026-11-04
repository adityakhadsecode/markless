"use client";

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from "react";
import { BlockMeta, BlockState, LogEntry, SectionMeta } from "./SwarmTypes";

interface SwarmContextType {
  blocks: Map<string, BlockMeta>;
  sections: Map<string, SectionMeta>;
  activeSectionId: string | null;
  logs: LogEntry[];
  controllerMode: 'auto' | 'manual';
  isRebuilding: boolean;
  restartSignal: number;
  registerBlock: (block: {
    id: string;
    sectionId: string;
    element: HTMLElement | null;
    jsx: string;
    preferredAgent?: string;
    isHeadline?: boolean;
    headlineText?: string;
  }) => void;
  unregisterBlock: (id: string) => void;
  setBlockState: (id: string, state: BlockState, updates?: Partial<BlockMeta>) => void;
  registerSection: (id: string, element: HTMLElement | null, blockIds: string[]) => void;
  setActiveSectionId: (id: string | null) => void;
  addLog: (entry: { agentName: string; agentColor: string; action: string; blockId?: string }) => void;
  setControllerMode: (mode: 'auto' | 'manual') => void;
  skip: () => void;
  rebuild: () => void;
}

const SwarmContext = createContext<SwarmContextType | null>(null);

export function SwarmProvider({ children }: { children: ReactNode }) {
  const blocksRef = useRef<Map<string, BlockMeta>>(new Map());
  const sectionsRef = useRef<Map<string, SectionMeta>>(new Map());
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [controllerMode, setControllerMode] = useState<'auto' | 'manual'>('auto');
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [restartSignal, setRestartSignal] = useState<number>(0);
  const [, setRerenderKey] = useState<number>(0);

  const forceUpdate = useCallback(() => {
    setRerenderKey((k) => (k + 1) % 100000);
  }, []);

  const registerBlock = useCallback(
    (meta: {
      id: string;
      sectionId: string;
      element: HTMLElement | null;
      jsx: string;
      preferredAgent?: string;
      isHeadline?: boolean;
      headlineText?: string;
    }) => {
      const existing = blocksRef.current.get(meta.id);
      const state: BlockState = existing ? existing.state : 'empty';
      blocksRef.current.set(meta.id, {
        ...meta,
        state,
      });
      if (meta.element) {
        meta.element.setAttribute('data-state', state);
      }
      forceUpdate();
    },
    [forceUpdate]
  );

  const unregisterBlock = useCallback((id: string) => {
    blocksRef.current.delete(id);
  }, []);

  const setBlockState = useCallback(
    (id: string, state: BlockState, updates?: Partial<BlockMeta>) => {
      const b = blocksRef.current.get(id);
      if (b) {
        const next: BlockMeta = { ...b, state, ...updates };
        blocksRef.current.set(id, next);
        if (next.element) {
          next.element.setAttribute('data-state', state);
        }
        forceUpdate();
      }
    },
    [forceUpdate]
  );

  const registerSection = useCallback(
    (id: string, element: HTMLElement | null, blockIds: string[]) => {
      sectionsRef.current.set(id, {
        id,
        element,
        blockIds,
        isStarted: false,
        isDone: false,
      });
      forceUpdate();
    },
    [forceUpdate]
  );

  const addLog = useCallback(
    (entry: { agentName: string; agentColor: string; action: string; blockId?: string }) => {
      const now = new Date();
      const timeStr = [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
      ].join(':');

      const newEntry: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: timeStr,
        ...entry,
      };

      setLogs((prev) => {
        const next = [...prev, newEntry];
        return next.slice(-8); // keep last 8 entries
      });
    },
    []
  );

  const skip = useCallback(() => {
    blocksRef.current.forEach((b) => {
      b.state = 'done';
      if (b.element) {
        b.element.setAttribute('data-state', 'done');
      }
    });
    sectionsRef.current.forEach((s) => {
      s.isStarted = true;
      s.isDone = true;
    });
    addLog({
      agentName: 'Swarm',
      agentColor: '#2563eb',
      action: 'Skip triggered · All blocks marked done',
    });
    forceUpdate();
  }, [addLog, forceUpdate]);

  const rebuild = useCallback(() => {
    setIsRebuilding(true);
    setControllerMode('auto');
    addLog({
      agentName: 'Swarm',
      agentColor: '#2563eb',
      action: 'Rebuild requested · Tearing down from bottom...',
    });

    // Reset typed count on all blocks immediately
    blocksRef.current.forEach((b) => {
      (b as any)._typedCount = 0;
    });

    // 1. Get all blocks sorted from bottom to top (by page Y position)
    const blockList: BlockMeta[] = Array.from(blocksRef.current.values());
    blockList.sort((a, b) => {
      const topA = a.element ? a.element.getBoundingClientRect().top + window.scrollY : 0;
      const topB = b.element ? b.element.getBoundingClientRect().top + window.scrollY : 0;
      return topB - topA; // bottom first
    });

    // 2. Drop blocks back to skeleton (rough), then empty from bottom up
    let delay = 0;
    const stepDuration = 20; // 20ms stagger per block
    blockList.forEach((block) => {
      setTimeout(() => {
        block.state = 'rough';
        (block as any)._typedCount = 0;
        if (block.element) block.element.setAttribute('data-state', 'rough');
        forceUpdate();

        setTimeout(() => {
          block.state = 'empty';
          (block as any)._typedCount = 0;
          if (block.element) block.element.setAttribute('data-state', 'empty');
          forceUpdate();
        }, 30);
      }, delay);
      delay += stepDuration;
    });

    // 3. Scroll smoothly to the top and restart from top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Reset sections
      sectionsRef.current.forEach((s) => {
        s.isStarted = false;
        s.isDone = false;
      });
      setTimeout(() => {
        setIsRebuilding(false);
        setRestartSignal((s) => s + 1);
        addLog({
          agentName: 'Swarm',
          agentColor: '#2563eb',
          action: 'Restarting swarm build from top...',
        });
      }, 500);
    }, delay + 80);
  }, [addLog, forceUpdate]);

  return (
    <SwarmContext.Provider
      value={{
        blocks: blocksRef.current,
        sections: sectionsRef.current,
        activeSectionId,
        logs,
        controllerMode,
        isRebuilding,
        restartSignal,
        registerBlock,
        unregisterBlock,
        setBlockState,
        registerSection,
        setActiveSectionId,
        addLog,
        setControllerMode,
        skip,
        rebuild,
      }}
    >
      {children}
    </SwarmContext.Provider>
  );
}

export function useSwarm() {
  const context = useContext(SwarmContext);
  if (!context) {
    throw new Error("useSwarm must be used within a SwarmProvider");
  }
  return context;
}

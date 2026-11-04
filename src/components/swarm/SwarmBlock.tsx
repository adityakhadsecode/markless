"use client";

import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";
import styles from "./SwarmBlock.module.css";
import { useSwarm } from "./SwarmContext";

interface SwarmBlockProps {
  id: string;
  sectionId: string;
  jsx: string;
  preferredAgent?: string;
  isHeadline?: boolean;
  headlineText?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function SwarmBlock({
  id,
  sectionId,
  jsx,
  preferredAgent,
  isHeadline,
  headlineText,
  className,
  style,
  children,
}: SwarmBlockProps) {
  const blockRef = useRef<HTMLDivElement | null>(null);
  const { registerBlock, unregisterBlock, blocks } = useSwarm();

  // Register block with Swarm context upon mount
  useEffect(() => {
    if (blockRef.current) {
      registerBlock({
        id,
        sectionId,
        element: blockRef.current,
        jsx,
        preferredAgent,
        isHeadline,
        headlineText,
      });
    }

    return () => {
      unregisterBlock(id);
    };
  }, [id, sectionId, jsx, preferredAgent, isHeadline, headlineText, registerBlock, unregisterBlock]);

  // Determine current state; default to 'empty' if registered or SSR
  const blockData = blocks.get(id);
  const state = blockData?.state || "empty";

  return (
    <div
      ref={blockRef}
      data-block={id}
      data-state={state}
      data-jsx={jsx}
      data-agent={preferredAgent}
      className={`${styles.block} ${className || ""}`.trim()}
      style={style}
    >
      <div className={styles.fill}>{children}</div>
    </div>
  );
}

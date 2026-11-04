"use client";

import React, { useRef, useEffect, ReactNode, CSSProperties } from "react";
import { useSwarm } from "./SwarmContext";

interface SwarmSectionProps {
  id: string;
  blockIds: string[];
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function SwarmSection({
  id,
  blockIds,
  className,
  style,
  children,
}: SwarmSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { registerSection } = useSwarm();

  useEffect(() => {
    if (sectionRef.current) {
      registerSection(id, sectionRef.current, blockIds);
    }
  }, [id, blockIds, registerSection]);

  return (
    <section
      ref={sectionRef}
      id={id}
      data-section={id}
      className={className}
      style={style}
    >
      {children}
    </section>
  );
}

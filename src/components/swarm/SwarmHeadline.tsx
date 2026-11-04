"use client";

import React, { ReactNode } from "react";
import overlayStyles from "./SwarmOverlay.module.css";
import { useSwarm } from "./SwarmContext";

interface SwarmHeadlineProps {
  blockId: string;
  text: string;
  children?: ReactNode;
  className?: string;
  renderHeading?: (typedText: string) => ReactNode;
}

export function SwarmHeadline({
  blockId,
  text,
  children,
  className,
  renderHeading,
}: SwarmHeadlineProps) {
  const { blocks } = useSwarm();
  const block = blocks.get(blockId);
  const state = block?.state || "empty";
  const assignedAgent = block?.assignedAgent;
  const agentColor = assignedAgent?.color || "#2563eb";

  const isTyping = state === "rough";
  const isDone = state === "done";

  const typedCount = (block as any)?._typedCount ?? (isDone ? text.length : 0);
  const displayedSlice = text.slice(0, typedCount);

  return (
    <div className={`${overlayStyles.headlineContainer} ${className || ""}`}>
      {/* 
        Base full text: hidden during typing so layout space is 100% reserved without reflow.
        Visible once done, or without JS.
      */}
      <div
        className={isTyping ? overlayStyles.headlineGhost : undefined}
        style={{
          visibility: isTyping ? "hidden" : "visible",
        }}
      >
        {children || text}
      </div>

      {/* Absolutely positioned typing overlay */}
      {isTyping && (
        <div className={overlayStyles.headlineOverlay} aria-hidden="true">
          {renderHeading ? (
            renderHeading(displayedSlice)
          ) : (
            <span>{displayedSlice}</span>
          )}
          <span
            id={`caret-${blockId}`}
            className={overlayStyles.caret}
            style={{
              backgroundColor: agentColor,
              color: agentColor,
            }}
          />
        </div>
      )}
    </div>
  );
}

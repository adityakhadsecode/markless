"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { SWARM_AGENTS, AgentConfig, BlockMeta, SectionMeta } from "./SwarmTypes";
import { useSwarm } from "./SwarmContext";
import overlayStyles from "./SwarmOverlay.module.css";

interface ActiveMarquee {
  blockId: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

export function SwarmController() {
  const {
    blocks,
    sections,
    activeSectionId,
    setActiveSectionId,
    logs,
    controllerMode,
    setControllerMode,
    isRebuilding,
    restartSignal,
    setBlockState,
    addLog,
    skip,
    rebuild,
  } = useSwarm();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cursorElsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeMarquees, setActiveMarquees] = useState<ActiveMarquee[]>([]);
  const [isHudMinimized, setIsHudMinimized] = useState<boolean>(false);

  // Cancellation tokens
  const abortControllerRef = useRef<AbortController | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 12 Live Cursors
  const cursorsRef = useRef<
    {
      config: AgentConfig;
      x: number;
      y: number;
      startX: number;
      startY: number;
      targetX: number;
      targetY: number;
      bow: number;
      mode: "idle" | "travel" | "mark" | "typing";
      jobStartTime: number;
      jobDuration: number;
      assignedBlockId?: string;
      onJobComplete?: () => void;
      wanderAngle: number;
      wanderSpeed: number;
      wanderRadiusX: number;
      wanderRadiusY: number;
      wanderPhase: number;
    }[]
  >(
    SWARM_AGENTS.map((agent, i) => ({
      config: agent,
      x: 180 + (i % 4) * 90,
      y: 100 + Math.floor(i / 4) * 60,
      startX: 0,
      startY: 0,
      targetX: 0,
      targetY: 0,
      bow: 0,
      mode: "idle",
      jobStartTime: 0,
      jobDuration: 400,
      wanderAngle: (i / 12) * Math.PI * 2,
      wanderSpeed: 0.7 + (i % 3) * 0.25,
      wanderRadiusX: 130 + (i % 4) * 25,
      wanderRadiusY: 70 + (i % 3) * 20,
      wanderPhase: i * 1.6,
    }))
  );

  // Helper to get sections in true DOM document order
  const getOrderedSections = useCallback((): SectionMeta[] => {
    if (typeof document === "undefined") return [];
    const domSections = Array.from(document.querySelectorAll("[data-section]"));
    return domSections
      .map((el) => sections.get(el.getAttribute("data-section") || ""))
      .filter((s): s is SectionMeta => !!s);
  }, [sections]);

  // Check if all registered blocks are complete
  const isWebsiteComplete =
    !isRebuilding &&
    blocks.size > 0 &&
    Array.from(blocks.values()).every((b) => b.state === "done");

  // -------------------------------------------------------------
  // 1. Deliberate User Scroll Detection
  // -------------------------------------------------------------
  useEffect(() => {
    let lastWheelTime = 0;
    let wheelNotchCount = 0;
    let touchStartY = 0;

    const isPlayLocked =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).has("play")
        : false;

    const handleDeliberateScroll = () => {
      if (isPlayLocked) return;
      if (controllerMode !== "manual") {
        setControllerMode("manual");
        addLog({
          agentName: "Swarm",
          agentColor: "#2563eb",
          action: "Deliberate scroll detected · Switched to IntersectionObserver",
        });
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 25) return;
      const now = performance.now();
      if (now - lastWheelTime < 500) {
        wheelNotchCount++;
        if (wheelNotchCount >= 2) {
          handleDeliberateScroll();
          wheelNotchCount = 0;
        }
      } else {
        wheelNotchCount = 1;
      }
      lastWheelTime = now;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const dy = Math.abs(e.touches[0].clientY - touchStartY);
        if (dy > 60) {
          handleDeliberateScroll();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Space",
        "Home",
        "End",
      ];
      if (scrollKeys.includes(e.code) || scrollKeys.includes(e.key)) {
        handleDeliberateScroll();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [controllerMode, setControllerMode, addLog]);

  // -------------------------------------------------------------
  // 2. IntersectionObserver (Manual Mode)
  // -------------------------------------------------------------
  useEffect(() => {
    if (controllerMode !== "manual") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionEl = entry.target as HTMLElement;
            const sectionId = sectionEl.getAttribute("data-section");
            if (sectionId) {
              const sec = sections.get(sectionId);
              if (sec && !sec.isStarted) {
                sec.isStarted = true;
                buildSection(sec);
              }
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll("[data-section]").forEach((el) => {
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [controllerMode, sections]);

  // -------------------------------------------------------------
  // 3. Single requestAnimationFrame Loop in Page Coordinates
  // -------------------------------------------------------------
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - lastTime) / 1000);
      lastTime = now;

      // Check if website build is finished: hover near HUD!
      const hudEl = document.querySelector(
        '[class*="hudConsole"], [class*="minimizedHudPill"]'
      );
      let hudCenterX = 180 + window.scrollX;
      let hudCenterY = window.scrollY + window.innerHeight - 100;
      if (hudEl) {
        const hRect = hudEl.getBoundingClientRect();
        hudCenterX = hRect.left + hRect.width / 2 + window.scrollX;
        hudCenterY = hRect.top + window.scrollY - 30;
      }

      // Find active section element coordinates for flocking & camera
      let activeSectionEl: HTMLElement | null = null;
      if (activeSectionId) {
        const sec = sections.get(activeSectionId);
        if (sec && sec.element) activeSectionEl = sec.element;
      }
      if (!activeSectionEl) {
        activeSectionEl = document.querySelector("[data-section]");
      }

      let flockCenterX = window.innerWidth / 2;
      let flockCenterY = window.scrollY + 280;
      let flockRadiusX = 220;
      let flockRadiusY = 120;

      if (activeSectionEl) {
        const sRect = activeSectionEl.getBoundingClientRect();
        flockCenterX = sRect.left + sRect.width / 2 + window.scrollX;
        flockCenterY = sRect.top + sRect.height / 2 + window.scrollY;
        flockRadiusX = Math.max(140, sRect.width / 2 - 40);
        flockRadiusY = Math.max(80, Math.min(260, sRect.height / 2));
      }

      const nextMarquees: ActiveMarquee[] = [];

      // Update all 12 cursors
      cursorsRef.current.forEach((c, idx) => {
        if (c.mode === "travel") {
          const elapsed = now - c.jobStartTime;
          const tau = Math.min(1, elapsed / c.jobDuration);
          const t =
            tau < 0.5 ? 4 * tau * tau * tau : 1 - Math.pow(-2 * tau + 2, 3) / 2;

          const sx = (1 - t) * c.startX + t * c.targetX;
          const sy = (1 - t) * c.startY + t * c.targetY;

          const dx = c.targetX - c.startX;
          const dy = c.targetY - c.startY;
          const dist = Math.hypot(dx, dy);
          let nx = 0;
          let ny = 0;
          if (dist > 0.1) {
            nx = -dy / dist;
            ny = dx / dist;
          }
          const bowOffset = Math.sin(Math.PI * t) * c.bow;

          c.x = sx + nx * bowOffset;
          c.y = sy + ny * bowOffset;

          if (tau >= 1) {
            c.x = c.targetX;
            c.y = c.targetY;
            c.mode = "idle";
            if (c.onJobComplete) {
              const cb = c.onJobComplete;
              c.onJobComplete = undefined;
              cb();
            }
          }
        } else if (c.mode === "mark") {
          const elapsed = now - c.jobStartTime;
          const tau = Math.min(1, elapsed / c.jobDuration);
          const t =
            tau < 0.5 ? 2 * tau * tau : 1 - Math.pow(-2 * tau + 2, 2) / 2;

          c.x = (1 - t) * c.startX + t * c.targetX;
          c.y = (1 - t) * c.startY + t * c.targetY;

          if (c.assignedBlockId) {
            const w = Math.max(0, c.x - c.startX);
            const h = Math.max(0, c.y - c.startY);
            nextMarquees.push({
              blockId: c.assignedBlockId,
              left: c.startX,
              top: c.startY,
              width: w,
              height: h,
            });
          }

          if (tau >= 1) {
            c.x = c.targetX;
            c.y = c.targetY;
            c.mode = "idle";
            if (c.onJobComplete) {
              const cb = c.onJobComplete;
              c.onJobComplete = undefined;
              cb();
            }
          }
        } else if (c.mode === "typing") {
          // Cursor follows the caret of its assigned block
          if (c.assignedBlockId) {
            const caretEl = document.getElementById(
              `caret-${c.assignedBlockId}`
            );
            if (caretEl) {
              const rect = caretEl.getBoundingClientRect();
              c.x = rect.left + window.scrollX + 2;
              c.y = rect.top + window.scrollY + 8;
            }
          }
        } else {
          // Idle behavior:
          // If website is complete, all cursors hover in a halo around the HUD!
          if (isWebsiteComplete) {
            c.wanderAngle += (0.7 + (idx % 3) * 0.25) * dt;
            const haloAngle = (idx / 12) * Math.PI * 2 + c.wanderAngle * 0.45;
            const haloRadiusX = 130 + (idx % 3) * 35;
            const haloRadiusY = 55 + (idx % 4) * 20;

            const targetX = hudCenterX + Math.cos(haloAngle) * haloRadiusX;
            const targetY = hudCenterY + Math.sin(haloAngle) * haloRadiusY;

            c.x += (targetX - c.x) * (3.5 * dt);
            c.y += (targetY - c.y) * (3.5 * dt);
          } else {
            // Idle: loose flocking drift around active section
            c.wanderAngle += c.wanderSpeed * dt;
            const targetFlockX =
              flockCenterX +
              Math.cos(c.wanderAngle + c.wanderPhase) *
                (flockRadiusX * (0.6 + 0.3 * Math.sin(c.wanderPhase)));
            const targetFlockY =
              flockCenterY +
              Math.sin(c.wanderAngle * 0.8 + c.wanderPhase) *
                (flockRadiusY * (0.6 + 0.3 * Math.cos(c.wanderPhase)));

            c.x += (targetFlockX - c.x) * (2.8 * dt);
            c.y += (targetFlockY - c.y) * (2.8 * dt);
          }
        }

        const el = cursorElsRef.current[idx];
        if (el) {
          el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
        }
      });

      setActiveMarquees(nextMarquees);

      // Camera auto-scroll director
      if (controllerMode === "auto" && !isRebuilding) {
        const inProgressBlocks: HTMLElement[] = [];
        blocks.forEach((b) => {
          if (b.state === "mark" || b.state === "rough") {
            if (b.element) inProgressBlocks.push(b.element);
          }
        });

        if (inProgressBlocks.length > 0) {
          let minY = Infinity;
          let maxY = -Infinity;

          inProgressBlocks.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const topPage = rect.top + window.scrollY;
            const bottomPage = rect.bottom + window.scrollY;
            if (topPage < minY) minY = topPage;
            if (bottomPage > maxY) maxY = bottomPage;
          });

          const vh = window.innerHeight;
          const currentScrollY = window.scrollY;
          const paddingTop = 45;
          const paddingBottom = 65;

          const neededForLowest = maxY + paddingBottom - vh;
          const maxAllowedForHighest = minY - paddingTop;

          let targetScrollY = currentScrollY;
          if (neededForLowest > currentScrollY) {
            targetScrollY = Math.min(neededForLowest, maxAllowedForHighest);
          } else if (currentScrollY > maxAllowedForHighest) {
            targetScrollY = maxAllowedForHighest;
          }

          if (Math.abs(targetScrollY - currentScrollY) > 2) {
            const step = (targetScrollY - currentScrollY) * 0.085;
            window.scrollTo({
              top: currentScrollY + step,
              behavior: "auto",
            });
          }
        }
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [
    activeSectionId,
    blocks,
    sections,
    controllerMode,
    isRebuilding,
    isWebsiteComplete,
  ]);

  // -------------------------------------------------------------
  // 4. Safe Cursor Acquisition (Never Clobbers Busy Cursor)
  // -------------------------------------------------------------
  const acquireCursor = useCallback(
    async (
      preferredName: string | undefined,
      pool: typeof cursorsRef.current,
      signal: AbortSignal
    ) => {
      while (!signal.aborted) {
        if (preferredName) {
          const named = cursorsRef.current.find(
            (c) =>
              c.config.name.toLowerCase() === preferredName.toLowerCase() &&
              c.mode === "idle"
          );
          if (named) return named;
        }
        const idleInPool = pool.find((c) => c.mode === "idle");
        if (idleInPool) return idleInPool;
        const anyIdle = cursorsRef.current.find((c) => c.mode === "idle");
        if (anyIdle) return anyIdle;
        await new Promise((r) => setTimeout(r, 35));
      }
      return cursorsRef.current[0];
    },
    []
  );

  const buildBlock = useCallback(
    async (
      block: BlockMeta,
      cursor: (typeof cursorsRef.current)[0],
      signal: AbortSignal
    ): Promise<void> => {
      if (signal.aborted) return;

      const el = block.element;
      if (!el) {
        setBlockState(block.id, "done");
        return;
      }

      const rect = el.getBoundingClientRect();
      const left = rect.left + window.scrollX;
      const top = rect.top + window.scrollY;
      const right = rect.right + window.scrollX;
      const bottom = rect.bottom + window.scrollY;
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      block.assignedAgent = cursor.config;

      // 1. Move cursor to top-left with ease-in-out and a slight bow
      await new Promise<void>((resolve) => {
        cursor.mode = "travel";
        cursor.startX = cursor.x;
        cursor.startY = cursor.y;
        cursor.targetX = left;
        cursor.targetY = top;
        cursor.bow = (cursor.config.id % 2 === 0 ? 1 : -1) * 35;
        cursor.jobStartTime = performance.now();
        cursor.jobDuration = 340;
        cursor.assignedBlockId = block.id;
        cursor.onJobComplete = () => resolve();
      });

      if (signal.aborted) return;

      // 2. Mark state: Cursor drags dashed blue marquee from top-left to bottom-right
      setBlockState(block.id, "mark");
      addLog({
        agentName: cursor.config.name,
        agentColor: cursor.config.color,
        action: `marked ${block.id} (${width} × ${height})`,
        blockId: block.id,
      });

      await new Promise<void>((resolve) => {
        cursor.mode = "mark";
        cursor.startX = left;
        cursor.startY = top;
        cursor.targetX = right;
        cursor.targetY = bottom;
        cursor.jobStartTime = performance.now();
        cursor.jobDuration = 360;
        cursor.assignedBlockId = block.id;
        cursor.onJobComplete = () => resolve();
      });

      if (signal.aborted) return;

      // 3. Rough state: solid blue outline, corner handles, grey skeleton, dark JSX tooltip
      setBlockState(block.id, "rough");
      addLog({
        agentName: cursor.config.name,
        agentColor: cursor.config.color,
        action: `rough ${block.jsx}`,
        blockId: block.id,
      });

      // 4. If Headline: type characters into absolutely positioned overlay
      if (block.isHeadline && block.headlineText) {
        cursor.mode = "typing";
        cursor.assignedBlockId = block.id;
        const fullText = block.headlineText;
        const totalChars = fullText.length;
        const charDelay = Math.max(16, Math.min(32, 650 / totalChars));

        for (let i = 1; i <= totalChars; i++) {
          if (signal.aborted) return;
          (block as any)._typedCount = i;
          setBlockState(block.id, "rough");
          await new Promise((r) => setTimeout(r, charDelay));
        }

        addLog({
          agentName: cursor.config.name,
          agentColor: cursor.config.color,
          action: `typed "${fullText.slice(0, 26)}..."`,
          blockId: block.id,
        });

        await new Promise((r) => setTimeout(r, 90));
      } else {
        await new Promise((r) => setTimeout(r, 200));
      }

      if (signal.aborted) return;

      // 5. Done state: content appears with short scale & blur, blue glow flashes on border
      cursor.mode = "idle";
      cursor.assignedBlockId = undefined;
      setBlockState(block.id, "done");
      addLog({
        agentName: cursor.config.name,
        agentColor: cursor.config.color,
        action: `done ${block.id}`,
        blockId: block.id,
      });
    },
    [setBlockState, addLog]
  );

  const buildSection = useCallback(
    async (section: SectionMeta) => {
      if (!abortControllerRef.current) {
        abortControllerRef.current = new AbortController();
      }
      const signal = abortControllerRef.current.signal;

      setActiveSectionId(section.id);
      section.isStarted = true;

      // Pool of up to 4 cursors for this section (shared round-robin)
      const ordered = getOrderedSections();
      const secIndex = ordered.findIndex((s) => s.id === section.id);
      const poolOffset = ((secIndex >= 0 ? secIndex : 0) * 4) % 12;
      const sectionPool = cursorsRef.current.slice(
        poolOffset,
        poolOffset + 4
      );

      // Section blocks in DOM order
      const blockMetas: BlockMeta[] = [];
      section.blockIds.forEach((bId) => {
        const b = blocks.get(bId);
        if (b) blockMetas.push(b);
      });

      let nextSectionTriggered = false;

      for (let i = 0; i < blockMetas.length; i++) {
        if (signal.aborted) return;
        const b = blockMetas[i];
        if (b.state === "done") continue;

        // Safely acquire an available idle cursor
        const cursor = await acquireCursor(b.preferredAgent, sectionPool, signal);
        if (signal.aborted) return;

        // Start building block
        const buildPromise = buildBlock(b, cursor, signal);

        // Overlapping pipeline: when this section is >=50% through, start next section!
        if (
          !nextSectionTriggered &&
          i >= Math.floor(blockMetas.length * 0.5) &&
          controllerMode === "auto"
        ) {
          nextSectionTriggered = true;
          const curSections = getOrderedSections();
          const curIdx = curSections.findIndex((s) => s.id === section.id);
          if (curIdx >= 0 && curIdx < curSections.length - 1) {
            const nextSec = curSections[curIdx + 1];
            if (!nextSec.isStarted) {
              nextSec.isStarted = true;
              setTimeout(() => {
                buildSection(nextSec);
              }, 100);
            }
          }
        }

        await buildPromise;
        await new Promise((r) => setTimeout(r, 60));
      }

      section.isDone = true;

      if (!nextSectionTriggered && controllerMode === "auto") {
        const curSections = getOrderedSections();
        const curIdx = curSections.findIndex((s) => s.id === section.id);
        if (curIdx >= 0 && curIdx < curSections.length - 1) {
          const nextSec = curSections[curIdx + 1];
          if (!nextSec.isStarted) {
            nextSec.isStarted = true;
            buildSection(nextSec);
          }
        }
      }
    },
    [
      blocks,
      setActiveSectionId,
      acquireCursor,
      buildBlock,
      controllerMode,
      getOrderedSections,
    ]
  );

  // -------------------------------------------------------------
  // 5. Initial Build Sequence on Load & Restart
  // -------------------------------------------------------------
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const ac = new AbortController();
    abortControllerRef.current = ac;

    // Reset cursors to idle
    cursorsRef.current.forEach((c) => {
      c.mode = "idle";
      c.assignedBlockId = undefined;
      c.onJobComplete = undefined;
    });

    const timer = setTimeout(() => {
      if (ac.signal.aborted) return;
      const ordered = getOrderedSections();
      if (ordered.length > 0) {
        addLog({
          agentName: "Swarm",
          agentColor: "#2563eb",
          action: "Swarm initialized · 12 agent cursors ready",
        });
        ordered[0].isStarted = true;
        buildSection(ordered[0]);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [restartSignal, buildSection, addLog, getOrderedSections]);

  return (
    <>
      {/* Absolute Full-Page Coordinates Overlay for Cursors & Marquees */}
      <div ref={containerRef} className={overlayStyles.overlayLayer}>
        {/* Active Marquees */}
        {activeMarquees.map((m) => (
          <div
            key={m.blockId}
            className={overlayStyles.marqueeBox}
            style={{
              transform: `translate3d(${m.left}px, ${m.top}px, 0)`,
              width: `${m.width}px`,
              height: `${m.height}px`,
            }}
          >
            <div className={overlayStyles.dimensionsLabel}>
              {Math.round(m.width)} × {Math.round(m.height)}
            </div>
          </div>
        ))}

        {/* 12 Named Agent Cursors */}
        {SWARM_AGENTS.map((agent, i) => (
          <div
            key={agent.id}
            ref={(el) => {
              cursorElsRef.current[i] = el;
            }}
            className={overlayStyles.cursorWrapper}
            style={{
              transform: `translate3d(${cursorsRef.current[i].x}px, ${cursorsRef.current[i].y}px, 0)`,
            }}
          >
            {/* SVG Arrow */}
            <svg
              className={overlayStyles.cursorArrow}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 2L9 18L11.5 11.5L18 9L3 2Z"
                fill={agent.color}
                stroke="#ffffff"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>

            {/* Small Name Tag in Brand Colour */}
            <div
              className={overlayStyles.cursorTag}
              style={{
                backgroundColor: agent.color,
              }}
            >
              {agent.name}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed HUD Log Console & Controls in the Corner */}
      {isHudMinimized ? (
        <div
          className={overlayStyles.minimizedHudPill}
          onClick={() => setIsHudMinimized(false)}
          role="button"
          tabIndex={0}
          title="Click to expand Agent Swarm HUD"
        >
          <div className={overlayStyles.pulseDot} />
          <span className={overlayStyles.hudTitle}>Agent Swarm HUD</span>
          <span className={overlayStyles.expandPillBadge}>Show</span>
        </div>
      ) : (
        <aside
          className={overlayStyles.hudConsole}
          aria-label="Agent Swarm Telemetry"
        >
          <div className={overlayStyles.hudHeader}>
            <div className={overlayStyles.hudTitleGroup}>
              <div className={overlayStyles.pulseDot} />
              <span className={overlayStyles.hudTitle}>Agent Swarm HUD</span>
            </div>

            <div className={overlayStyles.hudButtonGroup}>
              <button
                type="button"
                onClick={() => setIsHudMinimized(true)}
                className={`${overlayStyles.hudBtn} ${overlayStyles.hudBtnGhost}`}
                title="Hide / Minimize HUD"
              >
                Hide
              </button>
              <button
                type="button"
                onClick={skip}
                className={overlayStyles.hudBtn}
                title="Finish all blocks immediately"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={rebuild}
                className={`${overlayStyles.hudBtn} ${overlayStyles.hudBtnPrimary}`}
                title="Tear down from bottom up and replay swarm build"
              >
                Rebuild
              </button>
            </div>
          </div>

          {/* Live Event Stream */}
          <div className={overlayStyles.logList} role="log" aria-live="polite">
            {logs.length === 0 ? (
              <div className="text-[10px] text-zinc-500 py-2">
                Waiting for swarm orchestrator...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className={overlayStyles.logItem}>
                  <span className={overlayStyles.logTime}>[{log.timestamp}]</span>
                  <span
                    className={overlayStyles.logAgentTag}
                    style={{ backgroundColor: log.agentColor }}
                  >
                    {log.agentName}
                  </span>
                  <span className={overlayStyles.logAction}>{log.action}</span>
                </div>
              ))
            )}
          </div>

          {/* Footer Mode Indicator */}
          <div className={overlayStyles.hudModeStatus}>
            <span>
              {isWebsiteComplete
                ? "Swarm: All blocks built · Hovering"
                : controllerMode === "auto"
                ? "Mode: Auto-Scroll Director"
                : "Mode: Viewport (IntersectionObserver)"}
            </span>
            <span className="tabular-nums">12 agents · 3 palettes</span>
          </div>
        </aside>
      )}
    </>
  );
}

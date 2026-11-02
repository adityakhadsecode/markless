"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Clock, Sliders } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProcessResult } from "@/lib/watermark/types";

interface TelemetryBadgeProps {
  result: ProcessResult | null;
  dimensions?: { width: number; height: number } | null;
}

export function TelemetryBadge({ result, dimensions }: TelemetryBadgeProps) {
  if (!result) return null;

  const isRemoved = result.status === "removed";
  const confidence = result.detection?.confidence ?? 0;
  const confPercent = Math.round(confidence * 100);

  return (
    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
      {/* Status Badge */}
      {isRemoved ? (
        <Badge
          variant="outline"
          className="border border-[#003d21]/30 bg-[#aafdc0] text-[#003d21] font-medium"
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-[#003d21]" />
          <span>Restored exact</span>
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border border-[#c0c2a9] bg-[#ffc0e6] text-[#3f0929] font-medium"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Skipped (no watermark)</span>
        </Badge>
      )}

      {/* Profile & Resolution */}
      {dimensions && (
        <Badge variant="outline" className="border border-[#c0c2a9] bg-[#edeee1] text-[#202020] tabular-nums">
          {dimensions.width} × {dimensions.height}
        </Badge>
      )}

      {result.variant && (
        <Badge variant="outline" className="border border-[#c0c2a9] bg-[#ffffff] text-[#000000] gap-1.5">
          <Sliders className="h-3.5 w-3.5 text-[#5a5a4f]" />
          <span>Profile: {result.variant}</span>
          {result.usedLegacyFallback && (
            <span className="text-[10px] text-[#5a5a4f]">(fallback)</span>
          )}
        </Badge>
      )}

      {/* Confidence */}
      {result.detection && (
        <Badge
          variant="outline"
          className="border border-[#c0c2a9] bg-[#ffffff] text-[#202020] tabular-nums"
        >
          {confPercent}% match
        </Badge>
      )}

      {/* Latency */}
      <Badge variant="outline" className="border border-[#c0c2a9] bg-[#edeee1] text-[#5a5a4f] ml-auto tabular-nums">
        <Clock className="h-3.5 w-3.5" />
        <span>{result.elapsedMs.toFixed(1)} ms</span>
      </Badge>
    </div>
  );
}

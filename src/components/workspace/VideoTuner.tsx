"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Sliders, RotateCcw, Crosshair, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type { VideoTunerSettings, VideoWatermarkBox } from "@/lib/video/types";
import { cleanFrame, VIDEO_PRESETS, VIDEO_DEFAULTS } from "@/lib/video/config";

interface VideoTunerProps {
  frame: { width: number; height: number; imageData: ImageData } | null;
  sparkleImg: HTMLImageElement | null;
  base: VideoWatermarkBox | null;
  settings: VideoTunerSettings;
  onChange: (settings: VideoTunerSettings) => void;
}

export function VideoTuner({
  frame,
  sparkleImg,
  base,
  settings,
  onChange,
}: VideoTunerProps) {
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activePreset, setActivePreset] = useState<"veo" | "corner">("veo");
  const [activeRoiCoords, setActiveRoiCoords] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Renders the live cleaned frame and corner zoom with optical coordinate reticle
  const renderTuner = useCallback(() => {
    if (!frame || !sparkleImg || !base || !mainCanvasRef.current || !zoomCanvasRef.current) return;

    const { width, height, imageData } = frame;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offscreen = offscreenCanvasRef.current;
    offscreen.width = width;
    offscreen.height = height;

    const copyData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      width,
      height,
    );

    const { wm, roi } = cleanFrame(sparkleImg, copyData, width, height, base, settings);
    setActiveRoiCoords({ x: Math.round(wm.x), y: Math.round(wm.y), w: Math.round(wm.width), h: Math.round(wm.height) });

    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    if (!offCtx) return;
    offCtx.putImageData(copyData, 0, 0);

    // 1. Draw Main Overview Canvas
    const main = mainCanvasRef.current;
    const maxW = 340;
    const scale = Math.min(1, maxW / width);
    main.width = Math.round(width * scale);
    main.height = Math.round(height * scale);
    const mctx = main.getContext("2d");
    if (mctx) {
      mctx.drawImage(offscreen, 0, 0, main.width, main.height);
      mctx.strokeStyle = "#000000";
      mctx.lineWidth = 1.5;
      mctx.strokeRect(wm.x * scale, wm.y * scale, wm.width * scale, wm.height * scale);
    }

    // 2. Draw Zoomed Corner Canvas (200x200, magnified) with optical measurement reticle
    const zoom = zoomCanvasRef.current;
    const zctx = zoom.getContext("2d");
    if (zctx) {
      zctx.imageSmoothingEnabled = false;
      zctx.clearRect(0, 0, zoom.width, zoom.height);
      zctx.drawImage(
        offscreen,
        roi.x,
        roi.y,
        roi.width,
        roi.height,
        0,
        0,
        zoom.width,
        zoom.height,
      );
      const sx = zoom.width / roi.width;
      const sy = zoom.height / roi.height;
      const rx = (wm.x - roi.x) * sx;
      const ry = (wm.y - roi.y) * sy;
      const rw = wm.width * sx;
      const rh = wm.height * sy;

      // Optical coordinate crosshairs & reticle ticks
      zctx.strokeStyle = "rgba(170, 253, 192, 0.4)";
      zctx.lineWidth = 1;
      zctx.setLineDash([2, 4]);
      // Center cross lines
      zctx.beginPath();
      zctx.moveTo(rx + rw / 2, 0);
      zctx.lineTo(rx + rw / 2, zoom.height);
      zctx.moveTo(0, ry + rh / 2);
      zctx.lineTo(zoom.width, ry + rh / 2);
      zctx.stroke();
      zctx.setLineDash([]);

      // Bounding reticle box
      zctx.strokeStyle = "#aafdc0";
      zctx.lineWidth = 2;
      zctx.strokeRect(rx, ry, rw, rh);
    }
  }, [frame, sparkleImg, base, settings]);

  useEffect(() => {
    renderTuner();
  }, [renderTuner]);

  const applyPreset = (presetId: "veo" | "corner") => {
    setActivePreset(presetId);
    const preset = VIDEO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      onChange({ ...preset.settings });
    }
  };

  const toNumber = (val: number | readonly number[]): number => {
    return Array.isArray(val) ? val[0] : typeof val === "number" ? val : 0;
  };

  return (
    <div className="flex flex-col gap-4 rounded-[18px] border border-[#000000] bg-[#ffffff] p-5 text-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c0c2a9] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-[8px] border border-[#000000] bg-[#aafdc0] text-[#000000]">
            <Crosshair className="h-4 w-4" />
          </div>
          <span className="font-semibold text-base text-[#000000] tracking-tight">
            Interactive watermark tuner
          </span>
          <Badge variant="outline" className="text-[10px] font-mono border border-[#003d21]/30 text-[#003d21] bg-[#aafdc0]">
            Live preview
          </Badge>
        </div>
        <Button
          variant="outline"
          size="xs"
          onClick={() => applyPreset(activePreset)}
          className="text-xs text-[#5a5a4f] hover:text-[#000000] h-7 font-mono"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset preset
        </Button>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#000000] font-mono">
          Veo geometry preset
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VIDEO_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p.id)}
              className={`rounded-[10px] border p-2.5 text-left transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                activePreset === p.id
                  ? "border-[#000000] bg-[#edeee1] text-[#000000]"
                  : "border-[#c0c2a9] bg-transparent text-[#5a5a4f] hover:border-[#000000] hover:text-[#000000]"
              }`}
            >
              <div className="text-xs font-semibold font-mono">{p.label}</div>
              <div className="text-[10px] text-[#5a5a4f] mt-0.5 line-clamp-1">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview Views (Main + Zoomed Corner) */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center bg-[#1e1e1e] rounded-[12px] p-4 border border-[#000000]">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-mono text-[#f8f9eb] mb-1.5 flex items-center gap-1 tracking-normal">
            <Eye className="h-3.5 w-3.5 text-[#aafdc0]" /> Full frame
          </span>
          <canvas
            ref={mainCanvasRef}
            className="rounded-[6px] border border-[#c0c2a9]/40 bg-black max-h-48"
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-1.5">
            <span className="text-[10px] font-mono text-[#aafdc0] flex items-center gap-1 font-medium">
              <Crosshair className="h-3.5 w-3.5" /> Optical reticle
            </span>
            {activeRoiCoords && (
              <span className="text-[9px] font-mono text-[#aafdc0]/80 tabular-nums">
                [{activeRoiCoords.x}, {activeRoiCoords.y}, {activeRoiCoords.w}×{activeRoiCoords.h}]
              </span>
            )}
          </div>
          <canvas
            ref={zoomCanvasRef}
            width={200}
            height={200}
            className="rounded-[6px] border border-[#aafdc0] bg-black"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>

      <p className="text-[11px] text-[#5a5a4f] leading-relaxed font-sans">
        Tune the sliders until the watermark completely disappears in the{" "}
        <span className="text-[#003d21] font-mono font-medium bg-[#aafdc0] px-1 rounded">green optical reticle</span>. All adjustments apply in real time.
      </p>

      {/* Live Tuning Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5 pt-1">
        {/* Gain / Strength */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#5a5a4f]">Inversion strength (gain)</span>
            <span className="font-semibold text-[#000000] tabular-nums">
              {settings.gain.toFixed(2)}×
            </span>
          </div>
          <Slider
            value={[settings.gain]}
            min={0.1}
            max={3.0}
            step={0.05}
            onValueChange={(val) => onChange({ ...settings, gain: toNumber(val) })}
          />
        </div>

        {/* Size Scale */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#5a5a4f]">Watermark size</span>
            <span className="font-semibold text-[#000000] tabular-nums">
              {settings.sizeScale.toFixed(2)}×
            </span>
          </div>
          <Slider
            value={[settings.sizeScale]}
            min={0.2}
            max={2.0}
            step={0.05}
            onValueChange={(val) => onChange({ ...settings, sizeScale: toNumber(val) })}
          />
        </div>

        {/* Offset X */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#5a5a4f]">Position offset X</span>
            <span className="font-semibold text-[#000000] tabular-nums">
              {settings.offsetX > 0 ? `+${settings.offsetX}` : settings.offsetX} px
            </span>
          </div>
          <Slider
            value={[settings.offsetX]}
            min={-150}
            max={150}
            step={1}
            onValueChange={(val) => onChange({ ...settings, offsetX: toNumber(val) })}
          />
        </div>

        {/* Offset Y */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#5a5a4f]">Position offset Y</span>
            <span className="font-semibold text-[#000000] tabular-nums">
              {settings.offsetY > 0 ? `+${settings.offsetY}` : settings.offsetY} px
            </span>
          </div>
          <Slider
            value={[settings.offsetY]}
            min={-150}
            max={150}
            step={1}
            onValueChange={(val) => onChange({ ...settings, offsetY: toNumber(val) })}
          />
        </div>
      </div>
    </div>
  );
}

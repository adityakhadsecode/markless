"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { UploadCloud, Image as ImageIcon, Video as VideoIcon, Clipboard, FileArchive } from "lucide-react";

interface MediaDropzoneProps {
  mode: "image" | "video";
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function MediaDropzone({ mode, onFilesSelected, disabled }: MediaDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions =
    mode === "image" ? ".png, .jpg, .jpeg, .webp" : ".mp4, .webm, .mov";

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const valid: File[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (mode === "image" && file.type.startsWith("image/")) {
          valid.push(file);
        } else if (mode === "video" && file.type.startsWith("video/")) {
          valid.push(file);
        }
      }
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [mode, onFilesSelected],
  );

  // Global clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const file = items[i].getAsFile();
          if (file) pastedFiles.push(file);
        }
      }
      if (pastedFiles.length > 0) {
        handleFiles(pastedFiles);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [disabled, handleFiles]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group relative flex min-h-[360px] w-full cursor-pointer flex-col items-center justify-center rounded-[18px] border-[1.5px] border-dashed p-8 text-center transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isDragOver
          ? "border-[#000000] bg-[#aafdc0]/20"
          : "border-[#c0c2a9] bg-[#ffffff] hover:border-[#000000] hover:bg-[#fcfdf7]"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple={true}
        accept={acceptedExtensions}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />

      {/* Center Icon container: 16px rounded square filled with Mint Sprout and black outline */}
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] border border-[#000000] bg-[#aafdc0] text-[#000000] transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]">
        {mode === "image" ? (
          <ImageIcon className="h-6 w-6 stroke-[1.75]" />
        ) : (
          <VideoIcon className="h-6 w-6 stroke-[1.75]" />
        )}
      </div>

      {/* Main instructions with calm sentence case */}
      <h3 className="text-lg sm:text-xl font-semibold text-[#000000] tracking-tight font-sans">
        Drop {mode === "image" ? "Gemini images" : "Veo videos"} here, or{" "}
        <span className="underline decoration-[#000000] underline-offset-4 group-hover:text-[#202020]">
          browse files
        </span>
      </h3>

      <p className="mt-2 text-xs text-[#5a5a4f] max-w-md leading-relaxed font-sans">
        {mode === "image"
          ? "Supports Gemini 3.5+, Legacy Gemini, and free-tier half-scale PNGs/JPEGs. Batch files and clipboard paste supported."
          : "Supports Veo landscape & portrait videos. Multi-file batch queue, live interactive corner tuner, and lossless audio passthrough."}
      </p>

      {/* Pill Badges */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-[#202020]">
        <div className="flex items-center gap-1.5 rounded-full border border-[#c0c2a9] bg-[#edeee1] px-3 py-1">
          <Clipboard className="h-3.5 w-3.5 text-[#000000]" />
          <span>Ctrl+V / ⌘+V to paste</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#c0c2a9] bg-[#edeee1] px-3 py-1">
          <FileArchive className="h-3.5 w-3.5 text-[#5a5a4f]" />
          <span className="tabular-nums">{acceptedExtensions}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#c0c2a9] bg-[#edeee1] px-3 py-1">
          <UploadCloud className="h-3.5 w-3.5 text-[#003d21]" />
          <span>Batch queue enabled</span>
        </div>
      </div>
    </div>
  );
}

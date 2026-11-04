"use client";

import React, { useState } from "react";
import { Header, type StudioMode } from "@/components/workspace/Header";
import { ImageStudio } from "@/components/workspace/ImageStudio";
import { VideoStudio } from "@/components/workspace/VideoStudio";
import { Footer } from "@/components/workspace/Footer";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import {
  SwarmProvider,
  SwarmSection,
  SwarmBlock,
  SwarmHeadline,
  SwarmController,
} from "@/components/swarm";

export default function Home() {
  const [mode, setMode] = useState<StudioMode>("image");

  return (
    <SwarmProvider>
      <div className="relative min-h-screen flex flex-col bg-[#f8f9eb] text-[#000000] font-sans selection:bg-[#aafdc0] selection:text-[#003d21]">
        {/* Swarm Controller Overlay: 12 cursors, marquees, typing caretaker, and HUD console */}
        <SwarmController />

        {/* Section 1: Header */}
        <SwarmSection
          id="section-header"
          blockIds={["header-announcement", "header-nav"]}
          className="w-full"
        >
          <Header mode={mode} onModeChange={setMode} />
        </SwarmSection>

        {/* Section 2: Hero Section */}
        <SwarmSection
          id="section-hero"
          blockIds={["hero-headline", "hero-subheadline", "hero-math-badge"]}
          className="w-full pt-16 pb-8 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col items-center text-center"
        >
          {/* Monumental Display Headline */}
          <SwarmBlock
            id="hero-headline"
            sectionId="section-hero"
            jsx='<h1 className="hero-headline">REMOVE WATERMARKS...</h1>'
            isHeadline={true}
            headlineText="REMOVE WATERMARKS. NO BLUR NO ARTIFACTS"
            preferredAgent="Ada"
            className="w-full flex justify-center text-center"
          >
            <div className="w-full flex justify-center text-center">
              <SwarmHeadline
                blockId="hero-headline"
                text="REMOVE WATERMARKS. NO BLUR NO ARTIFACTS"
                className="text-center"
                renderHeading={(slice) => {
                  const line1 = "REMOVE WATERMARKS.";
                  if (slice.length <= line1.length) {
                    return (
                      <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#000000] leading-[0.92] uppercase font-sans max-w-4xl mx-auto text-center">
                        {slice}
                      </h1>
                    );
                  }
                  return (
                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#000000] leading-[0.92] uppercase font-sans max-w-4xl mx-auto text-center">
                      {line1}
                      <span className="block mt-2 text-[#202020]">
                        {slice.slice(line1.length).trimStart()}
                      </span>
                    </h1>
                  );
                }}
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-[#000000] leading-[0.92] uppercase font-sans max-w-4xl mx-auto text-center">
                  REMOVE WATERMARKS.
                  <span className="block mt-2 text-[#202020]">
                    NO BLUR NO ARTIFACTS
                  </span>
                </h1>
              </SwarmHeadline>
            </div>
          </SwarmBlock>

          {/* Subheadline with Typing Effect */}
          <SwarmBlock
            id="hero-subheadline"
            sectionId="section-hero"
            jsx='<p className="hero-subheadline">100% in-browser mathematical reverse alpha...</p>'
            isHeadline={true}
            headlineText="100% in-browser mathematical reverse alpha blending for Google Gemini AI images and Veo videos. Zero cloud uploads, zero generative hallucinations, and lossless audio preservation."
            preferredAgent="Hopper"
            className="mt-6 w-full flex justify-center text-center"
          >
            <div className="w-full flex justify-center text-center">
              <SwarmHeadline
                blockId="hero-subheadline"
                text="100% in-browser mathematical reverse alpha blending for Google Gemini AI images and Veo videos. Zero cloud uploads, zero generative hallucinations, and lossless audio preservation."
                className="text-center max-w-2xl mx-auto"
              >
                <p className="text-base sm:text-lg md:text-xl text-[#5a5a4f] max-w-2xl font-sans leading-relaxed text-center mx-auto">
                  100% in-browser mathematical reverse alpha blending for Google Gemini AI images and Veo videos.
                  Zero cloud uploads, zero generative hallucinations, and lossless audio preservation.
                </p>
              </SwarmHeadline>
            </div>
          </SwarmBlock>

          {/* Mathematical Inversion Badge */}
          <SwarmBlock
            id="hero-math-badge"
            sectionId="section-hero"
            jsx='<div className="math-badge">P₀ = (P_w − α · 255) / (1 − α)</div>'
            preferredAgent="Shannon"
            className="mt-6 w-full flex justify-center text-center"
          >
            <div className="w-full flex justify-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c0c2a9] bg-[#ffffff] px-3.5 py-1 text-xs font-mono text-[#202020]">
                <span className="text-[#5a5a4f]">Inversion equation:</span>
                <span className="font-semibold tabular-nums">P₀ = (P_w − α · 255) / (1 − α)</span>
              </div>
            </div>
          </SwarmBlock>
        </SwarmSection>

        {/* Section 3: Workspace & Studio Mode Selector */}
        <SwarmSection
          id="section-workspace"
          blockIds={["mode-selector", "workspace-viewport"]}
          className="w-full flex flex-col items-center"
        >
          {/* Mode Selector - Perfectly Centered */}
          <SwarmBlock
            id="mode-selector"
            sectionId="section-workspace"
            jsx='<StudioModeSwitcher mode={mode} />'
            preferredAgent="Pascal"
            className="w-full flex justify-center mb-6 px-4"
          >
            <div id="workspace" className="w-full flex justify-center">
              <div className="inline-flex p-1 rounded-[14px] border border-[#c0c2a9] bg-[#ffffff] gap-1">
                <button
                  type="button"
                  onClick={() => setMode("image")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] font-sans text-sm font-medium transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                    mode === "image"
                      ? "bg-[#202020] text-[#ffffff]"
                      : "text-[#5a5a4f] hover:text-[#000000] hover:bg-[#edeee1]"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Image Studio</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                      mode === "image"
                        ? "bg-white/20 text-white"
                        : "bg-[#edeee1] text-[#5a5a4f]"
                    }`}
                  >
                    Gemini
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("video")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-[10px] font-sans text-sm font-medium transition-all duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                    mode === "video"
                      ? "bg-[#202020] text-[#ffffff]"
                      : "text-[#5a5a4f] hover:text-[#000000] hover:bg-[#edeee1]"
                  }`}
                >
                  <Video className="h-4 w-4" />
                  <span>Video Studio</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-medium ${
                      mode === "video"
                        ? "bg-white/20 text-white"
                        : "bg-[#edeee1] text-[#5a5a4f]"
                    }`}
                  >
                    Veo
                  </span>
                </button>
              </div>
            </div>
          </SwarmBlock>

          {/* Main Studio Viewport - Centered */}
          <SwarmBlock
            id="workspace-viewport"
            sectionId="section-workspace"
            jsx={`<${mode === "image" ? "ImageStudio" : "VideoStudio"} />`}
            preferredAgent="Knuth"
            className="w-full flex justify-center pb-16"
          >
            <main className="w-full flex justify-center">
              <div className="w-full max-w-6xl mx-auto">
                {mode === "image" ? <ImageStudio /> : <VideoStudio />}
              </div>
            </main>
          </SwarmBlock>
        </SwarmSection>

        {/* Section 4: Approach Section (Forest Depths #003d21) */}
        <SwarmSection
          id="section-approach"
          blockIds={[
            "approach-header",
            "approach-equation",
            "approach-telemetry",
            "approach-card-1",
            "approach-card-2",
          ]}
          className="w-full bg-[#003d21] text-[#ffffff] rounded-t-[32px] pt-14 pb-16 px-6 sm:px-12 mt-12 overflow-hidden relative"
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-10 relative z-10">
            {/* Left Column: Specification */}
            <div className="flex flex-col gap-3 max-w-xl w-full">
              <SwarmBlock
                id="approach-header"
                sectionId="section-approach"
                jsx='<h2 className="approach-title">Mathematically exact, never generative</h2>'
                isHeadline={true}
                headlineText="Mathematically exact, never generative"
                preferredAgent="Lovelace"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-xs text-[#aafdc0] tracking-normal">
                    Reverse alpha specification
                  </span>
                  <SwarmHeadline
                    blockId="approach-header"
                    text="Mathematically exact, never generative"
                  >
                    <h2 className="text-3xl sm:text-4xl font-semibold text-[#aafdc0] leading-tight font-sans">
                      Mathematically exact, never generative
                    </h2>
                  </SwarmHeadline>
                  <p className="text-sm sm:text-base text-[#ffffff]/80 leading-relaxed font-sans mt-1">
                    Unlike inpainting models that hallucinate or blur pixels, reverse alpha blending calculates the exact original pixel values by inverting the compositor blending equation:
                  </p>
                </div>
              </SwarmBlock>

              {/* Exact Inversion Equation Box */}
              <SwarmBlock
                id="approach-equation"
                sectionId="section-approach"
                jsx='<code className="equation">Original = clamp((Watermarked − alpha × 255) / (1 − alpha), 0, 255)</code>'
                preferredAgent="Dijkstra"
                className="mt-3 w-full"
              >
                <div className="rounded-[12px] border border-[#aafdc0]/30 bg-[#002916] p-4 font-mono text-xs text-[#aafdc0]">
                  <div className="text-[11px] text-[#ffffff]/60 mb-1">Exact inversion equation</div>
                  <code className="tabular-nums">Original = clamp((Watermarked − alpha × 255) / (1 − alpha), 0, 255)</code>
                </div>
              </SwarmBlock>

              {/* Microscopic Pixel Inspection Visual */}
              <SwarmBlock
                id="approach-telemetry"
                sectionId="section-approach"
                jsx='<div className="telemetry-inspection">MAE < 0.12 LSB · Zero edge blur</div>'
                preferredAgent="Hamilton"
                className="mt-3 w-full"
              >
                <div className="p-3.5 rounded-[12px] border border-[#aafdc0]/20 bg-[#002b17] flex items-center justify-between gap-4 font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#aafdc0]/40 bg-[#003d21] text-[#aafdc0]">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[#ffffff] font-medium text-xs font-sans">Lossless pixel recovery</div>
                      <div className="text-[11px] text-[#aafdc0]/80 tabular-nums">MAE &lt; 0.12 LSB · Zero edge blur</div>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[#aafdc0] px-2 py-0.5 rounded border border-[#aafdc0]/40 bg-[#003d21]">
                    Calibrated
                  </span>
                </div>
              </SwarmBlock>
            </div>

            {/* Right Column: Architectural Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-md">
              {/* Card 1 */}
              <SwarmBlock
                id="approach-card-1"
                sectionId="section-approach"
                jsx='<Card title="100% Client-side" />'
                preferredAgent="Torvalds"
                className="h-full"
              >
                <div className="rounded-[16px] border border-[#000000] bg-[#aafdc0] p-5 text-[#000000] flex flex-col justify-between h-full">
                  <div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#000000] bg-[#ffffff] mb-3">
                      <ShieldCheck className="h-4 w-4 text-[#003d21]" />
                    </div>
                    <h3 className="font-semibold text-base font-sans">100% Client-side</h3>
                    <p className="text-xs text-[#202020] mt-1.5 leading-normal font-sans">
                      All images and videos stay inside local browser memory. Zero external server uploads.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#003d21] font-medium mt-4">
                    Verified local execution
                  </span>
                </div>
              </SwarmBlock>

              {/* Card 2 */}
              <SwarmBlock
                id="approach-card-2"
                sectionId="section-approach"
                jsx='<Card title="Hardware WebCodecs" />'
                preferredAgent="Ritchie"
                className="h-full"
              >
                <div className="rounded-[16px] border border-[#000000] bg-[#ffffff] p-5 text-[#000000] flex flex-col justify-between h-full">
                  <div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#000000] bg-[#aafdc0] mb-3">
                      <Cpu className="h-4 w-4 text-[#000000]" />
                    </div>
                    <h3 className="font-semibold text-base font-sans">Hardware WebCodecs</h3>
                    <p className="text-xs text-[#5a5a4f] mt-1.5 leading-normal font-sans">
                      GPU-accelerated video frame processing with lossless audio packet copying.
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[#000000] font-medium mt-4">
                    Lossless audio passthrough
                  </span>
                </div>
              </SwarmBlock>
            </div>
          </div>
        </SwarmSection>

        {/* Section 5: Core Architecture Cards */}
        <SwarmSection
          id="section-features"
          blockIds={[
            "features-header",
            "features-card-1",
            "features-card-2",
            "features-card-3",
            "features-card-4",
          ]}
          className="w-full bg-[#f8f9eb] py-14 px-6 max-w-6xl mx-auto"
        >
          <SwarmBlock
            id="features-header"
            sectionId="section-features"
            jsx='<h2 className="features-title">Optical precision restoration</h2>'
            isHeadline={true}
            headlineText="Optical precision restoration"
            preferredAgent="Wozniak"
            className="flex flex-col items-center text-center mb-8 w-full"
          >
            <div className="w-full flex flex-col items-center text-center">
              <span className="text-xs font-mono text-[#5a5a4f] mb-2">Core architecture</span>
              <SwarmHeadline
                blockId="features-header"
                text="Optical precision restoration"
                className="text-center"
              >
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#000000] font-sans text-center">
                  Optical precision restoration
                </h2>
              </SwarmHeadline>
            </div>
          </SwarmBlock>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Mint Sprout */}
            <SwarmBlock
              id="features-card-1"
              sectionId="section-features"
              jsx='<FeatureCard n="01" title="3-stage NCC detector" />'
              preferredAgent="Ada"
              className="h-full"
            >
              <div className="rounded-[16px] bg-[#aafdc0] p-5 text-[#003d21] flex flex-col justify-between min-h-[200px] h-full">
                <div>
                  <span className="font-mono text-[10px] font-medium text-[#003d21]/70">
                    01
                  </span>
                  <h3 className="font-semibold text-lg font-sans mt-1.5">
                    3-stage NCC detector
                  </h3>
                  <p className="text-xs text-[#003d21]/80 mt-1.5 leading-relaxed font-sans">
                    Spatial, gradient Sobel, and variance dampening cross-correlation for watermark alignment.
                  </p>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#003d21]">
                  Sub-pixel template matching
                </span>
              </div>
            </SwarmBlock>

            {/* Card 2: Lilac Wash */}
            <SwarmBlock
              id="features-card-2"
              sectionId="section-features"
              jsx='<FeatureCard n="02" title="Veo live tuner" />'
              preferredAgent="Turing"
              className="h-full"
            >
              <div className="rounded-[16px] bg-[#d3beff] p-5 text-[#2d0078] flex flex-col justify-between min-h-[200px] h-full">
                <div>
                  <span className="font-mono text-[10px] font-medium text-[#2d0078]/70">
                    02
                  </span>
                  <h3 className="font-semibold text-lg font-sans mt-1.5">
                    Veo live tuner
                  </h3>
                  <p className="text-xs text-[#2d0078]/80 mt-1.5 leading-relaxed font-sans">
                    Real-time corner magnifier with interactive gain, offset, and scale sliders before batch rendering.
                  </p>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#2d0078]">
                  Instant frame feedback
                </span>
              </div>
            </SwarmBlock>

            {/* Card 3: Sky Wash */}
            <SwarmBlock
              id="features-card-3"
              sectionId="section-features"
              jsx='<FeatureCard n="03" title="High-throughput batch" />'
              preferredAgent="Shannon"
              className="h-full"
            >
              <div className="rounded-[16px] bg-[#b0f4ff] p-5 text-[#041668] flex flex-col justify-between min-h-[200px] h-full">
                <div>
                  <span className="font-mono text-[10px] font-medium text-[#041668]/70">
                    03
                  </span>
                  <h3 className="font-semibold text-lg font-sans mt-1.5">
                    High-throughput batch
                  </h3>
                  <p className="text-xs text-[#041668]/80 mt-1.5 leading-relaxed font-sans">
                    Parallel image worker pool with hardware core auto-detection and sequential video queues.
                  </p>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#041668]">
                  Automatic ZIP bundle export
                </span>
              </div>
            </SwarmBlock>

            {/* Card 4: Rose Wash */}
            <SwarmBlock
              id="features-card-4"
              sectionId="section-features"
              jsx='<FeatureCard n="04" title="Residual inpainting" />'
              preferredAgent="Hopper"
              className="h-full"
            >
              <div className="rounded-[16px] bg-[#ffc0e6] p-5 text-[#3f0929] flex flex-col justify-between min-h-[200px] h-full">
                <div>
                  <span className="font-mono text-[10px] font-medium text-[#3f0929]/70">
                    04
                  </span>
                  <h3 className="font-semibold text-lg font-sans mt-1.5">
                    Residual inpainting
                  </h3>
                  <p className="text-xs text-[#3f0929]/80 mt-1.5 leading-relaxed font-sans">
                    Gradient-weighted Gaussian soft diffusion to polish compression artifacts on re-saved JPEGs.
                  </p>
                </div>
                <span className="font-mono text-[11px] font-medium text-[#3f0929]">
                  Adaptive edge smoothing
                </span>
              </div>
            </SwarmBlock>
          </div>
        </SwarmSection>

        {/* Section 6: Footer */}
        <SwarmSection
          id="section-footer"
          blockIds={[
            "footer-banner",
            "footer-links",
            "footer-telemetry",
            "footer-bottom",
          ]}
          className="w-full"
        >
          <Footer onSelectStudio={setMode} />
        </SwarmSection>
      </div>
    </SwarmProvider>
  );
}

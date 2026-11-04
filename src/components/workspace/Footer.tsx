"use client";

import React from "react";
import {
  ShieldCheck,
  Cpu,
  Layers,
  Heart,
  ArrowUp,
  Coffee,
  ExternalLink,
} from "lucide-react";
import { SwarmBlock, SwarmHeadline } from "@/components/swarm";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

interface FooterProps {
  onSelectStudio?: (mode: "image" | "video") => void;
}

export function Footer({ onSelectStudio }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToWorkspace = (mode?: "image" | "video") => {
    if (mode && onSelectStudio) {
      onSelectStudio(mode);
    }
    const el = document.getElementById("workspace");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 340, behavior: "smooth" });
    }
  };

  const scrollToApproach = () => {
    const el = document.getElementById("approach");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="w-full bg-[#f8f9eb] border-t border-[#c0c2a9] pt-14 pb-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Pre-Footer Action Banner */}
        <SwarmBlock
          id="footer-banner"
          sectionId="section-footer"
          jsx="<FooterActionBanner />"
          isHeadline={true}
          headlineText="Restore media locally. Zero cloud uploads, zero artifacts."
          preferredAgent="Pascal"
          className="mb-14"
        >
          <div className="rounded-[20px] border border-[#000000] bg-[#ffffff] p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative overflow-hidden">
            <div className="max-w-2xl relative z-10">
              <span className="font-mono text-xs text-[#003d21] font-medium tracking-normal">
                In-browser privacy
              </span>
              <SwarmHeadline
                blockId="footer-banner"
                text="Restore media locally. Zero cloud uploads, zero artifacts."
                renderHeading={(slice) => {
                  const line1 = "Restore media locally.";
                  if (slice.length <= line1.length) {
                    return (
                      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#000000] font-sans mt-1.5">
                        {slice}
                      </h2>
                    );
                  }
                  return (
                    <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#000000] font-sans mt-1.5">
                      {line1}
                      <span className="block text-[#5a5a4f] text-xl sm:text-2xl font-normal mt-1">
                        {slice.slice(line1.length).trimStart()}
                      </span>
                    </h2>
                  );
                }}
              >
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#000000] font-sans mt-1.5">
                  Restore media locally.
                  <span className="block text-[#5a5a4f] text-xl sm:text-2xl font-normal mt-1">
                    Zero cloud uploads, zero artifacts.
                  </span>
                </h2>
              </SwarmHeadline>
              <p className="mt-2.5 text-sm sm:text-base text-[#5a5a4f] font-sans leading-relaxed">
                Mathematical reverse alpha reconstruction executed 100% inside your browser threads.
                Your high-resolution images and videos never leave your local device.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
              <button
                type="button"
                onClick={() => scrollToWorkspace("image")}
                className="bg-[#202020] hover:bg-black text-[#ffffff] text-sm font-medium px-5 py-2.5 rounded-[10px] transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer font-sans flex items-center gap-2"
              >
                Start restoring
              </button>

              <a
                href="https://buymeacoffee.com/adityakhadse"
                target="_blank"
                rel="noreferrer"
                className="bg-[#ffffff] hover:bg-[#edeee1] border border-[#c0c2a9] text-[#202020] text-sm font-medium px-5 py-2.5 rounded-[10px] transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer font-sans flex items-center gap-2"
              >
                <Coffee className="h-4 w-4 text-[#000000]" />
                Buy Me a Coffee
              </a>
            </div>
          </div>
        </SwarmBlock>

        {/* Multi-Column Main Footer Grid */}
        <SwarmBlock
          id="footer-links"
          sectionId="section-footer"
          jsx="<FooterNavGrid columns={5} />"
          preferredAgent="Knuth"
          className="pb-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column (2 cols on lg) */}
            <div className="lg:col-span-2 flex flex-col justify-between">
              <div>
                {/* Logo with Sub-Badge & Subtitle */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-2xl tracking-tight text-[#000000] font-sans leading-none">
                      Markless
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-[#003d21] text-[#aafdc0] font-mono text-[9px] font-medium tracking-normal">
                      v2.0
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-[#5a5a4f] tracking-normal mt-1">
                    Reverse alpha restoration
                  </span>
                </div>

                <p className="mt-3 text-xs sm:text-sm text-[#5a5a4f] font-sans leading-relaxed max-w-sm">
                  Mathematically exact reverse alpha blending for Google Gemini AI images and Veo videos.
                  Engineered with pure TypeScript, Float32Array masks, and hardware-accelerated WebCodecs.
                </p>
              </div>
            </div>

            {/* Column 2: Studios */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-xs text-[#000000] font-medium tracking-normal">
                Studios
              </span>
              <ul className="flex flex-col gap-2 text-sm font-sans text-[#5a5a4f]">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToWorkspace("image")}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    Image Studio (Gemini)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToWorkspace("video")}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    Video Studio (Veo)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToWorkspace("video")}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    Corner magnifier tuner
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToWorkspace("image")}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    Batch worker processing
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Architecture */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-xs text-[#000000] font-medium tracking-normal">
                Architecture
              </span>
              <ul className="flex flex-col gap-2 text-sm font-sans text-[#5a5a4f]">
                <li>
                  <button
                    type="button"
                    onClick={scrollToApproach}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    Reverse alpha equation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={scrollToApproach}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    3-stage NCC detector
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={scrollToApproach}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    WebCodecs frame pipeline
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={scrollToApproach}
                    className="hover:text-black transition-colors cursor-pointer text-left"
                  >
                    Gaussian edge diffusion
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Project */}
            <div className="flex flex-col gap-2.5">
              <span className="font-mono text-xs text-[#000000] font-medium tracking-normal">
                Project
              </span>
              <ul className="flex flex-col gap-2 text-sm font-sans text-[#5a5a4f]">
                <li>
                  <a
                    href="https://github.com/adityakhadsecode/markless"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black transition-colors inline-flex items-center gap-1.5"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    <span>GitHub Repository</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/adityakhadsecode/markless/issues"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Issue Tracker</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://buymeacoffee.com/adityakhadse"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-black transition-colors inline-flex items-center gap-1.5"
                  >
                    <Coffee className="h-3.5 w-3.5 text-[#003d21]" />
                    <span>Buy Me a Coffee</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </SwarmBlock>

        {/* Feature Telemetry Badges Strip */}
        <SwarmBlock
          id="footer-telemetry"
          sectionId="section-footer"
          jsx="<FooterTelemetryStrip />"
          preferredAgent="Lovelace"
          className="border-t border-[#c0c2a9] pt-5 pb-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] text-[#5a5a4f]">
            <div className="flex flex-wrap items-center gap-5">
              <span className="flex items-center gap-1.5 text-[#000000] font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-[#003d21]" />
                100% in-browser execution
              </span>
              <span className="flex items-center gap-1.5 text-[#000000] font-medium">
                <Cpu className="h-3.5 w-3.5 text-[#000000]" />
                WebCodecs accelerated
              </span>
              <span className="flex items-center gap-1.5 text-[#000000] font-medium">
                <Layers className="h-3.5 w-3.5 text-[#000000]" />
                Lossless audio passthrough
              </span>
            </div>

            <div className="flex items-center gap-3 text-[#5a5a4f]">
              <span>Zero cloud transmission</span>
              <span>&bull;</span>
              <span>Unlimited local processing</span>
            </div>
          </div>
        </SwarmBlock>

        {/* Bottom Copyright & Back-to-Top Bar */}
        <SwarmBlock
          id="footer-bottom"
          sectionId="section-footer"
          jsx="<FooterBottomBar />"
          preferredAgent="Dijkstra"
          className="border-t border-[#c0c2a9] pt-5"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-[#5a5a4f]">
            <div className="flex items-center gap-1.5">
              <span>&copy; {new Date().getFullYear()} Markless. Crafted with</span>
              <Heart className="h-3 w-3 text-[#dc2626] fill-current" />
              <span>by</span>
              <a
                href="https://buymeacoffee.com/adityakhadse"
                target="_blank"
                rel="noreferrer"
                className="text-[#000000] font-medium underline underline-offset-4 hover:text-[#003d21] transition-colors"
              >
                Aditya Khadse
              </a>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#c0c2a9] hover:border-[#000000] bg-white text-[#202020] text-xs font-mono font-medium transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer"
              aria-label="Back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </SwarmBlock>
      </div>
    </footer>
  );
}

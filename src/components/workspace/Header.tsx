"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { getAssetPath } from "@/lib/utils/asset-path";
import { SwarmBlock } from "@/components/swarm";

export type StudioMode = "image" | "video";

interface HeaderProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
}

export function Header({ mode, onModeChange }: HeaderProps) {
  const [showBanner, setShowBanner] = useState(true);
  const [showProductsMenu, setShowProductsMenu] = useState(false);

  const scrollToStudio = () => {
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    window.scrollTo({ top: 880, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-[#f8f9eb] select-none">
      {/* Top Floating Announcement Pill Bar */}
      {showBanner && (
        <SwarmBlock
          id="header-announcement"
          sectionId="section-header"
          jsx="<HeaderAnnouncementBar />"
          preferredAgent="Ada"
          className="w-full pt-3 px-3 sm:px-6 max-w-7xl mx-auto"
        >
          <div className="w-full bg-[#1e1e1e] text-[#e8e9dc] rounded-[10px] px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between font-mono text-[11px] sm:text-[12px] tracking-normal">
            <div className="truncate flex-1 pr-3 text-[#dcded0]">
              <span>Enjoying Markless? Support the project on Buy Me a Coffee.</span>
              <a
                href="https://buymeacoffee.com/adityakhadse"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-white transition-colors cursor-pointer whitespace-nowrap ml-1.5"
              >
                Buy Me a Coffee &rarr;
              </a>
            </div>
            <button
              type="button"
              onClick={() => setShowBanner(false)}
              className="text-[#e8e9dc]/70 hover:text-white transition-colors p-1 rounded hover:bg-white/10 shrink-0 cursor-pointer"
              aria-label="Close announcement"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </SwarmBlock>
      )}

      {/* Main Top Navigation Header */}
      <SwarmBlock
        id="header-nav"
        sectionId="section-header"
        jsx="<HeaderNavigationBar mode={mode} />"
        preferredAgent="Turing"
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-4"
      >
        <header className="w-full flex items-center justify-between">
          {/* Left: Monumental Wordmark with Subtitle */}
          <div className="flex items-center">
            <a
              href={getAssetPath("/") || "/"}
              className="group flex flex-col justify-center select-none"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-2xl sm:text-[28px] tracking-tight text-[#000000] font-sans leading-none">
                  Markless
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-[5px] bg-[#003d21] text-[#aafdc0] font-mono text-[10px] font-medium tracking-normal">
                  v2.0
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#5a5a4f] tracking-normal mt-1">
                Reverse alpha restoration
              </span>
            </a>
          </div>

          {/* Right Group: Navigation links + Submit Issue + CTA Button */}
          <div className="flex items-center gap-6 sm:gap-8">
            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 sm:gap-7 text-[14px] font-medium text-[#1a1a1a] font-sans">
              {/* Products with studio toggle dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProductsMenu(!showProductsMenu)}
                  className="hover:text-black transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Studios</span>
                  <ChevronDown className="h-4 w-4 text-[#5a5a4f]" />
                </button>

                {showProductsMenu && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-[#ffffff] border border-[#c0c2a9] rounded-[12px] py-1.5 z-50 shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        onModeChange("image");
                        setShowProductsMenu(false);
                        scrollToStudio();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-mono text-[#202020] hover:bg-[#edeee1] flex items-center justify-between"
                    >
                      <span>Image Studio</span>
                      <span className="text-[10px] text-[#5a5a4f]">Gemini</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onModeChange("video");
                        setShowProductsMenu(false);
                        scrollToStudio();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-mono text-[#202020] hover:bg-[#edeee1] flex items-center justify-between"
                    >
                      <span>Video Studio</span>
                      <span className="text-[10px] text-[#5a5a4f]">Veo</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="hover:text-black transition-colors cursor-pointer"
              >
                Architecture
              </button>

              <a
                href="https://github.com/adityakhadsecode/markless/issues/new"
                target="_blank"
                rel="noreferrer"
                className="hover:text-black transition-colors cursor-pointer"
              >
                Submit Issue
              </a>
            </nav>

            {/* CTA Button */}
            <button
              type="button"
              onClick={scrollToStudio}
              className="bg-[#202020] hover:bg-black text-[#ffffff] text-xs sm:text-sm font-medium px-4 py-2 sm:px-5 sm:py-2.5 rounded-[10px] transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] cursor-pointer font-sans"
            >
              Start Restoring
            </button>
          </div>
        </header>
      </SwarmBlock>
    </div>
  );
}

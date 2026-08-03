"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Mouse, ChevronsUpDown } from "lucide-react";

import {
  STAGE_SECTIONS,
  getStageIndex,
  scrollToStageSection,
  useStageIndex,
} from "@/lib/scroll-stage";

export function ScrollSnapManager() {
  // Same position the 3D camera and the section transitions run on, so the
  // rail can never disagree with what the page is showing.
  const activeSection = useStageIndex();
  const [isSnapEnabled, setIsSnapEnabled] = useState(false);
  const isScrollingRef = useRef(false);
  const isSnapEnabledRef = useRef(false);

  const scrollToSection = (index: number) => {
    if (index < 0 || index >= STAGE_SECTIONS.length) return;
    isScrollingRef.current = true;
    scrollToStageSection(index);
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 1000); // 1-second cooldown for the smooth scroll animation
  };

  const toggleScrollMode = () => {
    const newValue = !isSnapEnabled;
    setIsSnapEnabled(newValue);
    isSnapEnabledRef.current = newValue;
    localStorage.setItem("scroll-snap-enabled", JSON.stringify(newValue));
  };

  useEffect(() => {
    // Initialize from localStorage on mount (client-side only)
    const saved = localStorage.getItem("scroll-snap-enabled");
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        setIsSnapEnabled(parsed);
        isSnapEnabledRef.current = parsed;
      } catch (e) {
        console.error("Error parsing scroll-snap-enabled from localStorage", e);
      }
    }

    // 1. Wheel Scroll Listener
    const handleWheel = (e: WheelEvent) => {
      if (!isSnapEnabledRef.current) return;
      const target = e.target as HTMLElement;
      // Allow scrolling inside form elements, modals, dialogs, or designated areas
      if (
        target.closest("textarea, input, select, [role='dialog'], [data-prevent-scroll-snap]")
      ) {
        return;
      }

      e.preventDefault();
      if (isScrollingRef.current) return;

      const currentIndex = getStageIndex();
      if (e.deltaY > 0) {
        scrollToSection(currentIndex + 1);
      } else if (e.deltaY < 0) {
        scrollToSection(currentIndex - 1);
      }
    };

    // 2. Keyboard Arrow Keys Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSnapEnabledRef.current) return;
      const target = e.target as HTMLElement;
      if (target.closest("textarea, input, select")) {
        return; // Don't intercept when writing text
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        const currentIndex = getStageIndex();
        scrollToSection(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        const currentIndex = getStageIndex();
        scrollToSection(currentIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        scrollToSection(0);
      } else if (e.key === "End") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        scrollToSection(STAGE_SECTIONS.length - 1);
      }
    };

    // 3. Touch Swipe Listener (Mobile support)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSnapEnabledRef.current) return;
      const target = e.target as HTMLElement;
      if (
        target.closest("textarea, input, select, [role='dialog'], [data-prevent-scroll-snap]")
      ) {
        return;
      }

      if (isScrollingRef.current) return;

      const touchEndY = e.touches[0].clientY;
      const diffY = touchStartY - touchEndY;

      // Threshold for swipe detection (60px)
      if (Math.abs(diffY) > 60) {
        const currentIndex = getStageIndex();
        if (diffY > 0) {
          scrollToSection(currentIndex + 1);
        } else {
          scrollToSection(currentIndex - 1);
        }
      }
    };

    // Bind non-passive listeners for wheel/touchmove to allow preventDefault()
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col items-center gap-4">
      {/* Scroll Mode Toggle */}
      <button
        onClick={toggleScrollMode}
        className="btn btn-sm btn-circle group relative border-base-300 bg-base-100 shadow-md hover:border-primary/40"
        aria-label={isSnapEnabled ? "Switch to Normal Scroll" : "Switch to Snap Scroll"}
        data-cursor="hover"
      >
        {isSnapEnabled ? (
          <ChevronsUpDown className="h-4 w-4 text-primary" />
        ) : (
          <Mouse className="h-4 w-4 text-base-content/70" />
        )}
        <span className="pointer-events-none absolute right-10 translate-x-2 whitespace-nowrap rounded-field border border-base-300 bg-base-100 px-2.5 py-1 font-mono-display text-[10px] uppercase tracking-wider opacity-0 shadow-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          {isSnapEnabled ? "Scroll: Snap" : "Scroll: Normal"}
        </span>
      </button>

      {/* Divider */}
      <div className="h-px w-4 bg-base-300" />

      {STAGE_SECTIONS.map((section, index) => {
        const isActive = activeSection === index;
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(index)}
            className="group relative flex items-center justify-end h-6 w-6"
            aria-label={`Scroll to ${section.label}`}
            data-cursor="hover"
          >
            {/* Hover Tooltip Label */}
            <span className="pointer-events-none absolute right-8 translate-x-2 rounded-field border border-base-300 bg-base-100 px-2.5 py-1 font-mono-display text-[10px] uppercase tracking-wider opacity-0 shadow-md transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              {section.label}
            </span>

            {/* Dot Indicator */}
            <div className="relative flex items-center justify-center h-full w-full">
              {isActive && (
                <motion.div
                  layoutId="active-dot-outline"
                  className="absolute h-5 w-5 rounded-full border border-primary/40"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.3 : 1,
                  backgroundColor: isActive
                    ? "var(--color-primary)"
                    : "var(--color-base-300)",
                }}
                className="h-2 w-2 rounded-full transition-colors duration-300"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

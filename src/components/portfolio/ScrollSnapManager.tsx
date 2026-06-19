"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "jobmatcher", label: "Job Fit" },
  { id: "experience", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Honors" },
  { id: "contact", label: "Contact" },
];

export function ScrollSnapManager() {
  const [activeSection, setActiveSection] = useState(0);
  const isScrollingRef = useRef(false);

  const getActiveSectionIndex = () => {
    let minDiff = Infinity;
    let activeIndex = 0;
    SECTIONS.forEach((section, index) => {
      const el = document.getElementById(section.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        const diff = Math.abs(rect.top);
        if (diff < minDiff) {
          minDiff = diff;
          activeIndex = index;
        }
      }
    });
    return activeIndex;
  };

  const scrollToSection = (index: number) => {
    if (index < 0 || index >= SECTIONS.length) return;
    const targetId = SECTIONS[index].id;
    const el = document.getElementById(targetId);
    if (el) {
      isScrollingRef.current = true;
      setActiveSection(index);
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 1000); // 1-second cooldown for the smooth scroll animation
    }
  };

  useEffect(() => {
    // 1. Wheel Scroll Listener
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      // Allow scrolling inside form elements, modals, dialogs, or designated areas
      if (
        target.closest("textarea, input, select, [role='dialog'], [data-prevent-scroll-snap]")
      ) {
        return;
      }

      e.preventDefault();
      if (isScrollingRef.current) return;

      const currentIndex = getActiveSectionIndex();
      if (e.deltaY > 0) {
        scrollToSection(currentIndex + 1);
      } else if (e.deltaY < 0) {
        scrollToSection(currentIndex - 1);
      }
    };

    // 2. Keyboard Arrow Keys Listener
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("textarea, input, select")) {
        return; // Don't intercept when writing text
      }

      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        const currentIndex = getActiveSectionIndex();
        scrollToSection(currentIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        const currentIndex = getActiveSectionIndex();
        scrollToSection(currentIndex - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        scrollToSection(0);
      } else if (e.key === "End") {
        e.preventDefault();
        if (isScrollingRef.current) return;
        scrollToSection(SECTIONS.length - 1);
      }
    };

    // 3. Touch Swipe Listener (Mobile support)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
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
        const currentIndex = getActiveSectionIndex();
        if (diffY > 0) {
          scrollToSection(currentIndex + 1);
        } else {
          scrollToSection(currentIndex - 1);
        }
      }
    };

    // 4. Synchronization on manual scroll
    const handleScroll = () => {
      if (!isScrollingRef.current) {
        setActiveSection(getActiveSectionIndex());
      }
    };

    // Bind non-passive listeners for wheel/touchmove to allow preventDefault()
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-4">
      {SECTIONS.map((section, index) => {
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
            <span className="absolute right-8 px-2.5 py-1 rounded bg-surface border border-hairline text-[10px] font-mono-display uppercase tracking-wider text-foreground opacity-0 translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shadow-md">
              {section.label}
            </span>

            {/* Dot Indicator */}
            <div className="relative flex items-center justify-center h-full w-full">
              {isActive && (
                <motion.div
                  layoutId="active-dot-outline"
                  className="absolute h-5 w-5 rounded-full border border-lime/40"
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
              <motion.div
                animate={{
                  scale: isActive ? 1.3 : 1,
                  backgroundColor: isActive ? "var(--lime)" : "var(--hairline)",
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

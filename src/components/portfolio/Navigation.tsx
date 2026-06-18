"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navItems, profile } from "@/lib/portfolio-data";
import { Magnetic } from "./Magnetic";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4"
      >
        <motion.nav
          animate={{
            width: scrolled ? "min(92vw, 720px)" : "min(92vw, 1100px)",
            backgroundColor: scrolled
              ? "var(--surface)"
              : "rgba(0,0,0,0)",
            borderColor: scrolled
              ? "var(--hairline)"
              : "rgba(0,0,0,0)",
            backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="flex items-center justify-between rounded-full border px-4 py-2.5 md:px-6"
        >
          {/* Logo / initials */}
          <Magnetic
            as="button"
            onClick={() => handleNav("hero")}
            strength={0.3}
            dataCursor="hover"
            className="flex items-center gap-2.5"
            ariaLabel="Go to top"
          >
            <div className="relative h-8 w-8 flex items-center justify-center">
              <motion.div
                className="absolute inset-0 rounded-full border border-lime/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <span className="font-display text-[12px] font-bold text-lime">
                {profile.initials}
              </span>
            </div>
            <span className="hidden md:block font-mono-display text-[11px] uppercase tracking-[0.25em] text-foreground/80">
              Nutankumar.KM
            </span>
          </Magnetic>

          {/* Desktop nav items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                data-cursor="hover"
                className="relative px-3.5 py-1.5 font-mono-display text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-lime/60 mr-1.5">{item.index}</span>
                {item.label}
                {active === item.id && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-full border border-lime/40 bg-lime/5"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Right side: theme toggle + CTA */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Magnetic
              as="a"
              href={`mailto:${profile.email}`}
              strength={0.3}
              dataCursor="hover"
              dataCursorLabel="Mail"
              className="hidden md:flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3.5 py-1.5 font-mono-display text-[11px] uppercase tracking-[0.18em] text-lime hover:bg-lime/20 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-lime animate-pulse" />
              Available
            </Magnetic>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen((s) => !s)}
            data-cursor="hover"
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Open menu"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
              className="block h-[1.5px] w-5 bg-foreground"
            />
            <motion.span
              animate={{ opacity: menuOpen ? 0 : 1 }}
              className="block h-[1.5px] w-5 bg-foreground"
            />
            <motion.span
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
              className="block h-[1.5px] w-5 bg-foreground"
            />
          </button>
        </motion.nav>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] bg-background/95 backdrop-blur-xl md:hidden flex flex-col items-center justify-center gap-2"
          >
            <div className="absolute top-5 right-5">
              <ThemeToggle />
            </div>
            {navItems.map((item, i) => (
              <motion.button
                key={item.id}
                onClick={() => handleNav(item.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: i * 0.05 }}
                className="font-display text-4xl text-foreground/90 py-2"
              >
                <span className="text-lime/60 text-base font-mono-display mr-3">
                  {item.index}
                </span>
                {item.label}
              </motion.button>
            ))}
            <motion.a
              href={`mailto:${profile.email}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems.length * 0.05 }}
              className="mt-6 rounded-full border border-lime/40 bg-lime/10 px-6 py-3 font-mono-display text-xs uppercase tracking-[0.2em] text-lime"
            >
              Get in touch
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

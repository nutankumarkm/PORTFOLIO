"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navItems, profile } from "@/lib/portfolio-data";
import { scrollToStageSection } from "@/lib/scroll-stage";
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

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleNav = (id: string, isRoute?: boolean) => {
    setMenuOpen(false);
    if (isRoute) {
      window.location.href = `/${id}`;
      return;
    }
    if (window.location.pathname !== "/" && window.location.pathname !== "/portfolio") {
      window.location.href = `/#${id}`;
    } else {
      // Lands on the section's stage anchor so the 3D camera arrives on its
      // waypoint at the same moment the section centers.
      scrollToStageSection(id);
    }
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
          animate={{ width: scrolled ? "min(92vw, 820px)" : "min(92vw, 1100px)" }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className={`navbar min-h-0 rounded-full border px-3 py-1.5 transition-colors duration-300 md:px-4 ${
            scrolled
              ? "border-base-300 bg-base-100/80 shadow-sm backdrop-blur-xl"
              : "border-transparent bg-transparent"
          }`}
        >
          {/* Logo / initials */}
          <div className="navbar-start w-auto flex-1">
            <Magnetic
              as="button"
              onClick={() => handleNav("hero")}
              strength={0.3}
              dataCursor="hover"
              className="flex items-center"
              ariaLabel="Go to top"
            >
              <div className="relative flex h-8 w-8 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <span className="font-display text-[12px] font-bold text-primary">
                  {profile.initials}
                </span>
              </div>
              <motion.span
                animate={{
                  width: scrolled ? 0 : "auto",
                  opacity: scrolled ? 0 : 1,
                  marginLeft: scrolled ? 0 : 10,
                }}
                transition={{ duration: 0.3 }}
                className="hidden overflow-hidden whitespace-nowrap font-mono-display text-[11px] uppercase tracking-[0.25em] text-base-content/80 md:block"
              >
                Nutankumar.KM
              </motion.span>
            </Magnetic>
          </div>

          {/* Desktop nav */}
          <div className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal menu-sm gap-1 p-0">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id, item.isRoute)}
                    data-cursor="hover"
                    aria-current={active === item.id ? "page" : undefined}
                    className={`relative rounded-full font-mono-display text-[11px] uppercase tracking-[0.18em] ${
                      active === item.id
                        ? "text-base-content"
                        : "text-base-content/60"
                    } ${scrolled ? "px-2.5" : "px-3.5"}`}
                  >
                    <span className="mr-1 text-primary/60">{item.index}</span>
                    {item.label}
                    {active === item.id && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 -z-10 rounded-full border border-primary/40 bg-primary/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Theme picker + availability CTA */}
          <div className="navbar-end w-auto flex-1 gap-1">
            <ThemeToggle />
            <motion.div
              animate={{
                width: scrolled ? 0 : "auto",
                opacity: scrolled ? 0 : 1,
                marginLeft: scrolled ? 0 : 4,
              }}
              transition={{ duration: 0.3 }}
              className="hidden overflow-hidden whitespace-nowrap md:flex"
            >
              <Magnetic
                as="a"
                href={`mailto:${profile.email}`}
                strength={0.3}
                dataCursor="hover"
                dataCursorLabel="Mail"
                className="btn btn-primary btn-soft btn-sm gap-2 rounded-full font-mono-display text-[11px] uppercase tracking-[0.18em]"
              >
                <span className="inline-grid h-1.5 w-1.5 place-items-center">
                  <span className="status status-primary animate-pulse" />
                </span>
                Available
              </Magnetic>
            </motion.div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMenuOpen((s) => !s)}
              data-cursor="hover"
              className="btn btn-ghost btn-sm btn-circle md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <span className="flex flex-col gap-[5px]">
                <motion.span
                  animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
                  className="block h-[1.5px] w-5 bg-base-content"
                />
                <motion.span
                  animate={{ opacity: menuOpen ? 0 : 1 }}
                  className="block h-[1.5px] w-5 bg-base-content"
                />
                <motion.span
                  animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
                  className="block h-[1.5px] w-5 bg-base-content"
                />
              </span>
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* Mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99] flex flex-col items-center justify-center bg-base-100/95 backdrop-blur-xl md:hidden"
          >
            <ul className="menu w-full max-w-xs gap-1">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <button
                    onClick={() => handleNav(item.id, item.isRoute)}
                    className={`font-display text-3xl ${
                      active === item.id ? "menu-active" : ""
                    }`}
                  >
                    <span className="font-mono-display text-sm text-primary/60">
                      {item.index}
                    </span>
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>

            <motion.a
              href={`mailto:${profile.email}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navItems.length * 0.05 }}
              className="btn btn-primary mt-8 rounded-full font-mono-display text-xs uppercase tracking-[0.2em]"
            >
              Get in touch
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

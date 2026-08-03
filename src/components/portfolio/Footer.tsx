"use client";

import { motion } from "framer-motion";
import { profile, navItems } from "@/lib/portfolio-data";

export function Footer() {
  const year = new Date().getFullYear();

  const scrollTo = (id: string, isRoute?: boolean) => {
    if (isRoute) {
      window.location.href = `/${id}`;
      return;
    }
    if (window.location.pathname !== "/" && window.location.pathname !== "/portfolio") {
      window.location.href = `/#${id}`;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="mt-auto border-t border-base-300 bg-base-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <footer className="footer sm:footer-horizontal gap-10 py-16">
          {/* Brand */}
          <aside className="max-w-xs">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                <span className="font-display text-sm font-bold text-primary">
                  {profile.initials}
                </span>
              </div>
              <div>
                <div className="font-display font-bold">{profile.name}</div>
                <div className="font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-60">
                  {profile.role}
                </div>
              </div>
            </div>
            <p className="text-sm leading-relaxed opacity-70">{profile.tagline}</p>
          </aside>

          {/* Sitemap */}
          <nav>
            <h6 className="footer-title font-mono-display tracking-[0.25em] text-primary opacity-100">
              Sitemap
            </h6>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id, item.isRoute)}
                data-cursor="hover"
                className="link link-hover group inline-flex items-center gap-2"
              >
                <span className="font-mono-display text-[10px] text-primary/60">
                  {item.index}
                </span>
                <span className="transition-transform group-hover:translate-x-1">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Connect */}
          <nav>
            <h6 className="footer-title font-mono-display tracking-[0.25em] text-primary opacity-100">
              Connect
            </h6>
            <a
              href={`mailto:${profile.email}`}
              data-cursor="hover"
              className="link link-hover break-all"
            >
              {profile.email}
            </a>
            <a href={`tel:${profile.phone}`} data-cursor="hover" className="link link-hover">
              {profile.phone}
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="link link-hover"
            >
              LinkedIn ↗
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="link link-hover"
            >
              GitHub ↗
            </a>
            <span className="opacity-60">{profile.location}</span>
          </nav>
        </footer>

        {/* Bottom bar */}
        <footer className="footer sm:footer-horizontal items-center justify-between border-t border-base-300 py-6">
          <p className="font-mono-display text-[10px] uppercase tracking-[0.2em] opacity-60">
            © {year} {profile.name}. Hand-crafted, no AI-generated content.
          </p>
          <button
            onClick={() => scrollTo("hero")}
            data-cursor="hover"
            className="btn btn-ghost btn-sm justify-self-end gap-2 font-mono-display text-[10px] uppercase tracking-[0.25em]"
          >
            Back to top
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              ↑
            </motion.span>
          </button>
        </footer>
      </div>
    </div>
  );
}

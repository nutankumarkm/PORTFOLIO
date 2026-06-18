"use client";

import { motion } from "framer-motion";
import { profile, navItems } from "@/lib/portfolio-data";

export function Footer() {
  const year = new Date().getFullYear();

  const scrollTo = (id: string, isRoute?: boolean) => {
    if (isRoute) {
      window.location.href = `/${id}`;
    } else {
      if (window.location.pathname !== "/" && window.location.pathname !== "/portfolio") {
        window.location.href = `/#${id}`;
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="relative border-t border-ink-600 bg-ink-900 px-4 sm:px-6 lg:px-8 pt-16 pb-8 mt-auto">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr] gap-10 pb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative h-10 w-10 flex items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full border border-lime/60"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                <span className="font-display text-sm font-bold text-lime">
                  {profile.initials}
                </span>
              </div>
              <div>
                <div className="font-display font-bold text-foreground">
                  {profile.name}
                </div>
                <div className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  {profile.role}
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              {profile.tagline}
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <div className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-lime mb-4">
              Sitemap
            </div>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id, item.isRoute)}
                    data-cursor="hover"
                    className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="font-mono-display text-[10px] text-lime/60">
                      {item.index}
                    </span>
                    <span className="group-hover:translate-x-1 transition-transform">
                      {item.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="font-mono-display text-[10px] uppercase tracking-[0.25em] text-lime mb-4">
              Connect
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`mailto:${profile.email}`}
                  data-cursor="hover"
                  className="text-muted-foreground hover:text-foreground transition-colors break-all"
                >
                  {profile.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${profile.phone}`}
                  data-cursor="hover"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {profile.phone}
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="hover"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  LinkedIn ↗
                </a>
              </li>
              <li className="text-muted-foreground">{profile.location}</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-ink-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="font-mono-display text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © {year} {profile.name}. Hand-crafted, no AI-generated content.
          </div>
          <button
            onClick={() => scrollTo("hero")}
            data-cursor="hover"
            className="group inline-flex items-center gap-2 font-mono-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-lime transition-colors"
          >
            Back to top
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
              ↑
            </motion.span>
          </button>
        </div>
      </div>
    </footer>
  );
}

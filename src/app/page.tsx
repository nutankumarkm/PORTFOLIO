"use client";

import { useCallback } from "react";
import dynamic from "next/dynamic";

import { scrollToStageSection } from "@/lib/scroll-stage";
import { SectionStage } from "@/components/portfolio/SectionStage";
import { Cursor } from "@/components/portfolio/Cursor";
import { ScrollProgress } from "@/components/portfolio/ScrollProgress";
import { IntroLoader } from "@/components/portfolio/IntroLoader";
import { Navigation } from "@/components/portfolio/Navigation";
import { Hero } from "@/components/portfolio/Hero";
import { About } from "@/components/portfolio/About";
import { Skills } from "@/components/portfolio/Skills";
import { JobMatcher } from "@/components/portfolio/JobMatcher";
import { Experience } from "@/components/portfolio/Experience";
import { Projects } from "@/components/portfolio/Projects";
import { Achievements } from "@/components/portfolio/Achievements";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { ChatWidget } from "@/components/portfolio/ChatWidget";
import { ScrollSnapManager } from "@/components/portfolio/ScrollSnapManager";
import { HandControl } from "@/components/portfolio/HandControl";

// Dynamically import the 3D scene (disabling SSR since WebGL is client-only)
const Scene3D = dynamic(
  () => import("@/components/portfolio/Scene3D"),
  { ssr: false }
);

export default function Home() {
  // Stable identity so the 3D tree isn't re-reconciled on a parent render
  const handleSelectProject = useCallback(() => {
    // Fly the camera and the page to the projects stop together
    scrollToStageSection("projects");
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-transparent">
      {/* 3D WebGL Scene in fixed background. Its camera and the sections below
          both animate off the shared stage position — see lib/scroll-stage. */}
      <Scene3D onSelectProject={handleSelectProject} />

      <IntroLoader />
      <Cursor />
      <ScrollProgress />
      <Navigation />
      <ChatWidget />
      <ScrollSnapManager />
      <HandControl />

      {/* Section order here is the camera's flight path — keep it in step with
          STAGE_SECTIONS in lib/scroll-stage. */}
      <main className="flex-1 relative z-10">
        <SectionStage id="hero"><Hero /></SectionStage>
        <SectionStage id="about"><About /></SectionStage>
        <SectionStage id="skills"><Skills /></SectionStage>
        <SectionStage id="jobmatcher"><JobMatcher /></SectionStage>
        <SectionStage id="experience"><Experience /></SectionStage>
        <SectionStage id="projects"><Projects /></SectionStage>
        <SectionStage id="achievements"><Achievements /></SectionStage>
        <SectionStage id="contact"><Contact /></SectionStage>
      </main>

      <div className="pointer-events-auto z-10"><Footer /></div>
    </div>
  );
}

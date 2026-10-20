/**
 * File: Home.tsx
 * Purpose: Home page: hero, "What I do" and the page index.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { HomeHero } from "../sections/HomeHero";
import { PageIndex } from "../sections/PageIndex";
import { SkillsShowcase } from "../sections/SkillsShowcase";

export default function Home() {
  return (
    <div className="page">
      <HomeHero />
      <SkillsShowcase />
      <PageIndex />
    </div>
  );
}

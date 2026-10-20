/**
 * File: Home.tsx
 * Purpose: Home page: hero and "What I do".
 * Author: Akilesh
 * Date: 2026-10-20
 */
import { HomeHero } from "../sections/HomeHero";
import { SkillsShowcase } from "../sections/SkillsShowcase";

export default function Home() {
  return (
    <div className="page">
      <HomeHero />
      <SkillsShowcase />
    </div>
  );
}

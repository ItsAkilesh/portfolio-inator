/**
 * File: site.ts
 * Purpose: Site-wide settings, SEO, greeting, social links, navigation, interface copy and analytics IDs.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { AnalyticsIds } from "../lib/analytics";
import type {
  Greeting,
  LinkItem,
  NavItem,
  Seo,
  Settings,
  UiCopy,
} from "../types/portfolio";

export const settings: Settings = {
  isSplash: true,
  showDotField: true,
};

export const seo: Seo = {
  title: "Akilesh Srinivasa Kumar",
  description:
    "Innovative software engineer specializing in Generative AI, XR, and cloud-native solutions, with published research experience and a strong background in full-stack development and intelligent systems.",
};

export const greeting: Greeting = {
  title: "Akilesh Srinivasa Kumar",
  logo_name: "Akilesh S",
  nickname: "ItsAkilesh",
  subTitle:
    "Innovative software engineer specializing in Generative AI, XR, and cloud-native solutions, with published research experience and a strong background in full-stack development and intelligent systems.",
  resumeLink:
    "https://drive.google.com/file/d/1_3rSBD241Xi988WnRWA9ICLh6wz4DqdB/view?usp=sharing",
  githubProfile: "https://github.com/itsakilesh",
};

export const socialMediaLinks: readonly LinkItem[] = [
  { name: "GitHub", link: "https://github.com/itsakilesh", icon: "github" },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/itsakilesh/",
    icon: "linkedin",
  },
  {
    name: "ORCiD",
    link: "https://orcid.org/0009-0006-7862-0447",
    icon: "orcid",
  },
  {
    name: "Email",
    link: "mailto:akilesh.srinivasakumar@gmail.com",
    icon: "gmail",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/akilesh.io",
    icon: "instagram",
  },
  { name: "WhatsApp", link: "https://wa.me/+14084939366", icon: "whatsapp" },
  {
    name: "ResearchGate",
    link: "https://www.researchgate.net/profile/Akilesh-Srinivasa-Kumar",
    icon: "researchgate",
  },
];

/** Header navigation, in order. Every page except Home also appears in the home page index. */
export const navigation: readonly NavItem[] = [
  { path: "/home", label: "Home" },
  { path: "/experience", label: "Experience" },
  { path: "/education", label: "Education" },
  { path: "/research", label: "Research" },
  { path: "/projects", label: "Projects" },
  { path: "/contact", label: "Get in Touch" },
];

export const ui: UiCopy = {
  skillsTitle: "What I do",
  indexTitle: "Explore",
  toolsLabel: "tools",
  resumeLabel: "See my résumé",
  moreProjectsLabel: "More on GitHub",
  readSummary: "Read summary",
  hideSummary: "Hide summary",
  allFilter: "All",
  footer: "Made by Akilesh Srinivasa Kumar",
  notFoundTitle: "Lost?",
  notFoundText: "This page does not exist. Try one of these instead.",
};

/** Leave an ID empty to disable that provider. */
export const analytics: AnalyticsIds = {
  googleAnalyticsId: "G-DDW4JPG9S7",
  clarityId: "uwpnm1dcod",
};

/**
 * File: links.ts
 * Purpose: Links page (link-in-bio) and Contact page content.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { LinkItem, PageHeader } from "../types/portfolio";

export const links: Omit<PageHeader, "description"> & {
  readonly profile_image_path: string;
  readonly links: readonly LinkItem[];
} = {
  title: "Links",
  subtitle: "Quick access to my profiles, resume, and work.",
  profile_image_path: "portrait.webp",
  links: [
    {
      name: "Portfolio",
      link: "/home",
      icon: "web",
    },
    {
      name: "Resume",
      link: "https://drive.google.com/file/d/1_3rSBD241Xi988WnRWA9ICLh6wz4DqdB/view?usp=sharing",
      icon: "resume",
    },
    {
      name: "Google Scholar",
      link: "https://scholar.google.com/citations?user=c3I3YmMAAAAJ&hl=en",
      icon: "googlescholar",
    },
    {
      name: "GitHub",
      link: "https://github.com/itsakilesh",
      icon: "github",
    },
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
    {
      name: "WhatsApp",
      link: "https://wa.me/+14084939366",
      icon: "whatsapp",
    },
    {
      name: "ResearchGate",
      link: "https://www.researchgate.net/profile/Akilesh-Srinivasa-Kumar",
      icon: "researchgate",
    },
  ],
};

export const contactPageData = {
  contactSection: {
    title: "Get in Touch",
    profile_image_path: "portrait.webp",
    description:
      "Feel free to reach out via email or follow me on social media using the links below. I'm always happy to help or talk.",
  },
  phoneSection: {
    title: "akilesh.srinivasakumar@gmail.com",
    subtitle: "+14084939366",
  },
} as const;

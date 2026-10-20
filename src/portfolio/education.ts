/**
 * File: education.ts
 * Purpose: Education page header and degrees.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { Degree, PageHeader } from "../types/portfolio";

export const educationHeader: PageHeader = {
  title: "Education",
  subtitle: "Degrees",
  description: "",
};

export const degrees: { readonly degrees: readonly Degree[] } = {
  degrees: [
    {
      title: "Carnegie Mellon University, Pittsburgh",
      subtitle: "Master of Software Engineering - Scalable Systems",
      logo_path: "cmu.webp",
      alt_name: "CMU",
      duration: "Aug 2026 - Dec 2027*",
      descriptions: [
        "⚡ Focus on scalable systems, distributed software, and large-scale engineering practices.",
      ],
      website_link: "https://www.cmu.edu/",
    },
    {
      title: "Vellore Institute of Technology, Chennai",
      subtitle: "M.Tech in Software Engineering",
      logo_path: "vit.webp",
      alt_name: "VIT Chennai",
      duration: "2021 - 2026",
      descriptions: [
        "⚡ CGPA: 8.76",
        "⚡ Core Computer engineering subjects like DS, Algorithms, DBMS, OS, CA, AI etc.",
        "⚡ Degree Specialization includes Software Architecture & Design, Software Project Management, Software Contruction & Maintenance, Agile, Scrum etc.",
      ],
      website_link: "http://chennai.vit.ac.in",
    },
  ],
};

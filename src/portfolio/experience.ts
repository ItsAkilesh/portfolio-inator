/**
 * File: experience.ts
 * Purpose: Experience page header and timeline sections (each section becomes a tab).
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { ExperienceSection, PageHeader } from "../types/portfolio";

export const experience: PageHeader & {
  readonly sections: readonly ExperienceSection[];
} = {
  title: "Experience",
  subtitle: "Work, Internship and Volunteership",
  description:
    "I've worked as an intern at various LLMOps, CloudOps, DevOps, Full Stack Development and other Software Engineering roles. I've also volunteered within my university and at conferences as a developer, designer and mentor.",
  sections: [
    {
      title: "Work",
      experiences: [
        {
          title: "AI Infrastructure & Research Intern",
          company: "Vigilnz Inc.",
          company_url: "https://vigilnz.com/",
          logo_path: "vigilnz.webp",
          duration: "August 2025 - Present",
          location: "Chennai, India",
          description:
            "Leading end-to-end AI infrastructure efforts, developing agentic workflows, language models and autonomous pipelines that fuse generative intelligence, adaptive threat modeling, and real-time vulnerability detection to advance next-generation SecOps.",
        },
        {
          title: "Research Intern",
          company: "Centre for Advanced Data Science, VIT Chennai",
          company_url:
            "https://chennai.vit.ac.in/research/research-centre/centre-for-advanced-data-science/",
          logo_path: "vit.webp",
          duration: "Mar 2024 - Nov 2024",
          location: "Chennai, India",
          description:
            "Researching multi-agent on-device scene reconstruction using Paligemma, InternVL, and LLaVA models for graph-based Retrieval-Augmented Generation (RAG) from input videos. Investigated the use of applying the image generation models to generate crime scene images from witness descriptions stored in a Neo4j knowledge graph.",
        },
        {
          title: "CloudOps Intern",
          company: "Automation Anywhere Software Pvt. Ltd.",
          company_url: "https://automationanywhere.com/",
          logo_path: "aa.webp",
          duration: "Aug 2023 - Nov 2023",
          location: "Bangalore, India",
          description:
            "Implemented automated IaC (Infrastructure as Code) scanning using Wiz and Env0 to proactively detect and provide actionable insights into security posture from Terraform/Terragrunt templates. Also implemented cost optimization for Cloud Operations on AWS by identifying key expenses on AWS services resulting in substantial cost savings.",
        },
        {
          title: "Software Engineer",
          company: "Impower Centre Pvt. Ltd.",
          company_url: "https://impowercentre.com/",
          logo_path: "impower.webp",
          duration: "Jan 2023 - Dec 2023",
          location: "Chennai, India",
          description:
            "Spearheaded the end-to-end development of a comprehensive website for Impower Centre, a multidisciplinary clinic specializing in occupational therapy, speech correction, and behavior correction, catering to patients with such conditions. Managed a cross-functional team of three members, overseeing the entire project lifecycle, from design and development to deployment. Played a pivotal role in client relations, requirement engineering and project management ensuring seamless communication between stakeholders and translating their needs into a feature-rich website.",
        },
        {
          title: "CloudOps Intern",
          company: "Nurtem Inc.",
          company_url: "https://www.nurtem.com/",
          logo_path: "nurtem.webp",
          duration: "Aug 2022 - Jan 2023",
          location: "California, USA",
          description:
            "Worked on Terraform, AWS EC2, Kubernetes, Docker containers along with CI/CD pipelines using Spinnaker and Jenkins to automate deployment process of the startup's workflow consisting of ReactJS server, Jenkins Test suite along with Django backend on Google Cloud Platform.",
        },
      ],
    },
    {
      title: "Volunteering",
      experiences: [
        {
          title: "Volunteer Educator",
          company: "LearningEdge",
          company_url: "#",
          logo_path: "learningedge.webp",
          duration: "Jan 2025 - Present",
          location: "Chennai, India",
          description:
            "Volunteer computer science educator and mentor, dedicated to providing guidance, teaching, and support to underprivileged students from diverse regions around the world, helping them develop essential technical skills, build confidence, and explore opportunities in the field of technology.",
        },
        {
          title: "Secretary",
          company: "Microsoft Innovations Club, VIT Chennai",
          company_url: "https://micvitc.github.io/",
          logo_path: "mic.webp",
          duration: "Apr 2023 - Nov 2023",
          location: "Chennai, India",
          description:
            "Organized multiple technical events, conducted interviews. Ideation of multiple innovative project ideas and task allocation to developers and contributors. Proposed and successfully implemented a new organizational structure for the club (200+ members) for the betterment of productivity. Came up with budgeting and marketing ideas to maximize community reach across VIT and other universities.",
        },
        {
          title: "Head of Web Development",
          company: "Microsoft Innovations Club, VIT Chennai",
          company_url: "https://micvitc.github.io/",
          logo_path: "mic.webp",
          duration: "Dec 2022 - Apr 2023",
          location: "Chennai, India",
          description:
            "Ideated and Spearheaded management of miscellaneous web development projects used within the club/university and coordinated over 25 team members to achieve completion of projects. Enforced quality standards and code reviews for the various language Tech Stacks and Frameworks used.",
        },
        {
          title: "Technical Volunteer",
          company: "NCVPRIPG, IIT Jodhpur",
          company_url: "https://ncvpripg2024.github.io/",
          logo_path: "iitj.webp",
          duration: "2023, 2024 & 2025",
          location: "Remote",
          description:
            "Volunteered for organizing the National Computer Vision conference and contributed to the dataset for the Detection of Pond Fish challenge (2023 and 2024) and Digitization of Handwritten Documents Challenge (2025).",
        },
      ],
    },
  ],
};

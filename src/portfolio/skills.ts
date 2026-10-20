/**
 * File: skills.ts
 * Purpose: "What I do" groups on the home page. Icons are keys from src/icons/registry.ts.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type { SkillGroup } from "../types/portfolio";

export const skills: { readonly data: readonly SkillGroup[] } = {
  data: [
    {
      title: "AI & LLMOps",
      skills: [
        "⚡ Developing highly scalable production ready pipelines for various GenAI and LLM use cases",
        "⚡ Experience of working with Multi-Modal and Vision Transformers",
        "⚡ Complex workflows with Retrieval-Augmented Generation & Agentic AI for real-world applications",
      ],
      softwareSkills: [
        {
          skillName: "Tensorflow",
          icon: "tensorflow",
        },
        {
          skillName: "PyTorch",
          icon: "pytorch",
        },
        {
          skillName: "Python",
          icon: "python",
        },
        {
          skillName: "OpenAI",
          icon: "openai",
        },
        {
          skillName: "Gemini",
          icon: "gemini",
        },
        {
          skillName: "Ollama",
          icon: "ollama",
        },
        {
          skillName: "LangChain",
          icon: "langchain",
        },
      ],
    },
    {
      title: "Cloud Infra-Architecture",
      skills: [
        "⚡ Experience working on multiple cloud platforms",
        "⚡ Hosting and maintaining cloud services with Terraform and Terragrunt",
        "⚡ Creating and configuring CI/CD pipelines",
        "⚡ Creating and configuring WSGI and reverse proxy pipelines",
      ],
      softwareSkills: [
        {
          skillName: "GCP",
          icon: "googlecloud",
        },
        {
          skillName: "AWS",
          icon: "aws",
        },
        {
          skillName: "Azure",
          icon: "azure",
        },
        {
          skillName: "Firebase",
          icon: "firebase",
        },
        {
          skillName: "PostgreSQL",
          icon: "postgresql",
        },
        {
          skillName: "MongoDB",
          icon: "mongodb",
        },
        {
          skillName: "Docker",
          icon: "docker",
        },
        {
          skillName: "Jenkins",
          icon: "jenkins",
        },
        {
          skillName: "Kubernetes",
          icon: "kubernetes",
        },
        {
          skillName: "Terraform",
          icon: "terraform",
        },
        {
          skillName: "Nginx",
          icon: "nginx",
        },
      ],
    },
    {
      title: "Full Stack Development",
      skills: [
        "⚡ Building responsive website front end using React",
        "⚡ Developing mobile applications using Flutter, Swift and solo android apps using Java",
        "⚡ Developing Native Windows Desktop apps using WinUI3, MAUI frameworks for .NET",
        "⚡ Creating application backend in Flask, Django & Node",
      ],
      softwareSkills: [
        {
          skillName: "HTML5",
          icon: "html5",
        },
        {
          skillName: "JavaScript",
          icon: "javascript",
        },
        {
          skillName: "ReactJS",
          icon: "react",
        },
        {
          skillName: "NodeJS",
          icon: "nodejs",
        },
        {
          skillName: "Django",
          icon: "django",
        },
        {
          skillName: "Flask",
          icon: "flask",
        },
        {
          skillName: "WinUI3/MAUI",
          icon: "windows",
        },
        {
          skillName: "C#",
          icon: "csharp",
        },
        {
          skillName: "Swift",
          icon: "swift",
        },
        {
          skillName: "Android",
          icon: "android",
        },
        {
          skillName: "Flutter",
          icon: "flutter",
        },
      ],
    },
    {
      title: "UI/UX, 3D Modelling, Animation and Editing",
      skills: [
        "⚡ Designing highly attractive user interface for mobile and web applications",
        "⚡ Creating the flow of application functionalities to optimize user experience",
        "⚡ Creating 3D models and animations with Blender",
        "⚡ Fully functional 2D and 3D Games, XR Apps with Unity and Unreal Engine",
        "⚡ Edit Videos and add animations with Final Cut Pro",
      ],
      softwareSkills: [
        {
          skillName: "Unity",
          icon: "unity",
        },
        {
          skillName: "Unreal Engine",
          icon: "unrealengine",
        },
        {
          skillName: "Blender",
          icon: "blender",
        },
        {
          skillName: "Figma",
          icon: "figma",
        },
        {
          skillName: "Sketch",
          icon: "sketch",
        },
      ],
    },
  ],
};

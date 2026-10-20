/**
 * File: research.ts
 * Purpose: Research page: header, citation stats, patents (featured) and publications (list).
 * Author: Akilesh
 * Date: 2026-10-20
 */
import type {
  PageHeader,
  ResearchGateStats,
  ResearchSection,
  ScholarStats,
} from "../types/portfolio";

export const research: PageHeader & {
  readonly scholarStats: ScholarStats;
  readonly researchGateStats: ResearchGateStats;
  readonly sections: readonly ResearchSection[];
} = {
  title: "Research",
  subtitle: "Patents and Publications",
  description:
    "I've explored research directions in areas such as artificial intelligence, security, and healthcare, with outcomes shared through peer-reviewed publications and a granted design patent.",
  scholarStats: {
    citations: 60,
    hIndex: 3,
    i10Index: 1,
    profileUrl: "https://scholar.google.com/citations?user=c3I3YmMAAAAJ&hl=en",
  },
  researchGateStats: {
    interestScore: 27.6,
    citations: 60,
    hIndex: 3,
    profileUrl: "https://www.researchgate.net/profile/Akilesh-Srinivasa-Kumar",
  },
  sections: [
    {
      title: "Patents",
      layout: "featured",
      research: [
        {
          title: "Incremental Streaming Binary Scanning",
          company: "United States Patent and Trademark Office",
          company_url: "https://uspto.gov/",
          logo_path: "uspto.webp",
          duration: "Filed Oct 14, 2025",
          location: "(Provisional) 3/898,766",
          description:
            "Designed a streaming binary scanning system for a wide range of complex data types including images, audio, video, and AI models with minimal memory overhead and high throughput for real-time data processing.",
        },
        {
          title: "Thumb Mounted Trackpad",
          company: "Intellectual Property Office, India",
          company_url:
            "https://search.ipindia.gov.in/IPOJournal/Journal/Patent",
          logo_path: "ipindia.webp",
          duration: "Issued Mar 29, 2024",
          location: "411985-001",
          description:
            "The thumb-mounted trackpad is a compact and wearable input device designed to fit on the user's thumb, enabling intuitive gesture-based control and improved portability. It offers an alternative to traditional input methods, making it particularly suited for mobile, assistive, and immersive computing environments.",
        },
      ],
    },
    {
      title: "Research Publications",
      layout: "list",
      research: [
        {
          title:
            "Zero-Shot Chain-Of-Thought Reasoning For Cryptanalysis Of Popular Ciphers",
          company:
            "Akilesh Srinivasa Kumar, Rajeev Sekar, Muhammad Kifayathullah, Dr Palani Thanaraj, Dr Christopher Columbus C",
          company_url:
            "https://doi.org/10.36227/techrxiv.175295517.70390739/v2",
          logo_path: "techrxiv.webp",
          duration: "",
          location: "TechRxiv",
          description:
            "Explored the use of reasoning-optimized Large Language Models (LLMs) to solve cryptographic ciphers using chain-of-thought techniques, analyzing their performance, reasoning patterns, and limitations across both classical and modern encryption methods.",
        },
        {
          title:
            "Multi-Agent hierarchical workflow for autonomous code generation with Large Language Models",
          company: "Akilesh Srinivasa Kumar, Rajeev Sekar, Dr Om Kumar C U",
          company_url: "https://doi.org/10.1109/SCEECS64059.2025.10940635",
          logo_path: "ieee.webp",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Developed a multi-agent hierarchical workflow for automating data analysis, code generation, testing, and debugging from CSV inputs, using tools like AlphaCodium, LangChain, LangGraph, and GPT to simulate an autonomous software development pipeline.",
        },
        {
          title:
            "Medical Diagnosis Through Conversational Intelligence Using Large Language Models",
          company: "Akilesh Srinivasa Kumar, Dr Suganya R, Girish H S",
          company_url: "https://doi.org/10.1007/978-981-97-4711-5_23",
          logo_path: "springer.webp",
          duration: "",
          location: "Springer",
          description:
            "Developed a conversational AI system leveraging Large Language Models (LLMs) to facilitate medical diagnosis through natural language interactions. The system engages users in symptom-driven dialogue, generating context-aware follow-up questions and providing preliminary diagnostic insights, with the goal of improving patient communication, reducing diagnostic errors, and supporting clinical decision-making.",
        },
        {
          title:
            "Graph Based Retrieval-Augmented Generation for Personalized Dietary Guidance with LLMs",
          company:
            "Akilesh Srinivasa Kumar, Rajeev Sekar, Tulasi Raman R, Dr Suganya R",
          company_url: "https://doi.org/10.1109/SCEECS64059.2025.10940424",
          logo_path: "ieee.webp",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Designed and implemented a personalized dietary recommendation system by integrating graph-based Retrieval-Augmented Generation (RAG) with Large Language Models (LLMs). The system utilizes a GraphDB to represent individual health profiles and nutritional knowledge, enabling context-aware and accurate meal suggestions tailored to user-specific dietary needs. This work highlights the intersection of AI, graph databases, and personalized healthcare solutions.",
        },
        {
          title:
            "On-Device Input Analysis to Proactively Enhance Data Security in Large Language Models",
          company:
            "Akilesh Srinivasa Kumar, Abinaya R, Rajeev Sekar,Dr Ganesan R",
          company_url: "https://doi.org/10.1109/AISP61711.2024.10870695",
          logo_path: "ieee.webp",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Developed a proactive data security framework that performs on-device input analysis to identify and filter sensitive information before it reaches Large Language Models (LLMs). The system enhances user privacy and safeguards data integrity by detecting potential security risks in real time, contributing to safer and more responsible deployment of LLM-powered applications.",
        },
        {
          title:
            "Extended Reality as an Assistive Technology for Patients Suffering from Neurodegenerative Diseases",
          company:
            "Akilesh Srinivasa Kumar, Sharon John, Tarun Vinod Pai, Dr Sakthivel V, Dr P Prakash",
          company_url: "https://doi.org/10.1109/ICECCE63537.2024.10823464",
          logo_path: "ieee.webp",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Designed an assistive system using Extended Reality (XR) technologies that integrates Unity AR Foundation and OpenCV to provide real-time facial recognition for patients with neurodegenerative conditions. The system enhances patient independence by overlaying digital identifiers on familiar faces within the user's environment, improving social interaction, reducing confusion, and supporting memory recall.",
        },
        {
          title:
            "EmoGPT: An Emotion-Aware Chatbot with Cause Modeling for Contextual Response Generation",
          company:
            "Dr Suganya R , Pradhyumn Nair, Akilesh Srinivasa Kumar, Tulasi Raman R, Girish H S",
          company_url: "https://dx.doi.org/10.2139/ssrn.5063888",
          logo_path: "ssrn.webp",
          duration: "",
          location: "SSRN",
          description:
            "Designed and implemented EmoGPT, an emotion-aware chatbot that integrates emotion cause pair modeling with GPT-2 to generate open-ended, contextually appropriate responses. The system enhances conversational depth and user emotional experience by understanding underlying causes of user sentiments, demonstrating the role of affective computing in human-centered AI applications.",
        },
        {
          title: "Carnatic Raga Recognition Using Deep Learning Techniques",
          company:
            "Rajeev Sekar, Dr M Poonkodi, K A Muhammad Kifayathullah, Abinaya R & Akilesh Srinivasa Kumar",
          company_url: "https://doi.org/10.1007/978-3-031-82386-2_14",
          logo_path: "springer.webp",
          duration: "",
          location: "Springer",
          description:
            "Developed a deep learning-based system for automated raga classification in Carnatic music using audio signal processing and models like ANN, LSTM, and Bi-LSTM, achieving 96.43% accuracy in capturing subtle tonal patterns and gamakas from the CompMusic dataset.",
        },
        {
          title:
            "A novel AI-based chatbot application for personalized medical diagnosis and review using large language models",
          company:
            "Akilesh Srinivasa Kumar, Dr Sheik Abdullah A, Abinaya R, Rajeev Sekar, Dhanushkodi S",
          company_url: "https://doi.org/10.1109/RMKMATE59243.2023.10368616",
          logo_path: "ieee.webp",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Developed a Java-based Android chatbot powered by GPT-3.5 to provide users with personalized medical diagnostics through conversational input. The application leverages natural language understanding to interpret symptoms, generate medically relevant insights, and deliver accessible healthcare support, aiming to bridge gaps in preliminary diagnosis and improve patient engagement.",
        },
      ],
    },
  ],
};

/* Change this file to get your personal Porfolio */

// Website related settings
const settings = {
  isSplash: true, // Change this to false if you don't want Splash screen.
};

//SEO Related settings
const seo = {
  title: "Akilesh Srinivasa Kumar",
  description:
    "I’m a passionate and persevering software engineer with experience across AI, XR, cloud infrastructure, and full-stack development, with a growing focus on Generative AI and intelligent systems. | Akilesh Srinivasa Kumar | Akilesh S | VIT Chennai | Vellore Institute of Technology | Research papers |"
  ,
  og: {
    title: "Akilesh Srinivasa Kumar | Akilesh S",
    type: "website",
    url: "https://github.com/itsakilesh",
  },
};

//Home Page
const greeting = {
  title: "Akilesh Srinivasa Kumar",
  logo_name: "Akilesh S",
  nickname: "ItsAkilesh",
  subTitle:
    "I’m a passionate and persevering software engineer with experience across AI, XR, cloud infrastructure, and full-stack development, with a growing focus on Generative AI and intelligent systems.",
  resumeLink:
    "https://drive.google.com/file/d/1_3rSBD241Xi988WnRWA9ICLh6wz4DqdB/view?usp=sharing",
  githubProfile: "https://github.com/itsakilesh",
};

const socialMediaLinks = [


  {
    name: "Github",
    link: "https://github.com/itsakilesh",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/itsakilesh/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "ORCiD",
    link: "https://orcid.org/0009-0006-7862-0447",
    fontAwesomeIcon: "fa-orcid", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#457412", // Reference https://simpleicons.org/?q=instagram
  },
  {
    name: "Email",
    link: "mailto:akilesh.srinivasakumar@gmail.com",
    fontAwesomeIcon: "fa-envelope",
    fontAwesomeClass: "fas",
    backgroundColor: "#349beb",
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/akilesh.io",
    fontAwesomeIcon: "fa-instagram", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#E4405F", // Reference https://simpleicons.org/?q=instagram
  },
  {
    name: "WhatsApp",
    link: "https://wa.me/+14084939366",
    fontAwesomeIcon: "fa-whatsapp", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#068c59", // Reference https://simpleicons.org/?q=instagram
  },
  {
    name: "ResearchGate",
    link: "https://www.researchgate.net/profile/Akilesh-Srinivasa-Kumar",
    fontAwesomeIcon: "fa-researchgate", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
];

const skills = {
  data: [
    {
      title: "AI & LLMOps",
      fileName: "DataScienceImg",
      skills: [
        "⚡ Developing highly scalable production ready pipelines for various GenAI and LLM use cases",
        "⚡ Experience of working with Multi-Modal and Vision Transformers",
        "⚡ Complex workflows with Retrieval-Augmented Generation & Agentic AI for real-world applications",
      ],
      softwareSkills: [
        {
          skillName: "Tensorflow",
          fontAwesomeClassname: "logos-tensorflow",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "PyTorch",
          fontAwesomeClassname: "logos-pytorch",
          style: {
            backgroundColor: "transparent",
          },
        },
        {
          skillName: "Python",
          fontAwesomeClassname: "ion-logo-python",
          style: {
            backgroundColor: "transparent",
            color: "#3776AB",
          },
        },
        {
          skillName: "OpenAI",
          imageSrc: "openai-logo.png",
        },
        {
          skillName: "Gemini",
          imageSrc: "gemini.png",
        },
        {
          skillName: "Ollama",
          imageSrc: "ollama.png",
        },
        {
          skillName: "LangChain",
          imageSrc: "langchain.png",
        },

      ],
    },
    {
      title: "Cloud Infra-Architecture",
      fileName: "CloudInfraImg",
      skills: [
        "⚡ Experience working on multiple cloud platforms",
        "⚡ Hosting and maintaining cloud services with Terraform and Terragrunt",
        "⚡ Creating and configuring CI/CD pipelines",
        "⚡ Creating and configuring WSGI and reverse proxy pipelines",
      ],
      softwareSkills: [
        {
          skillName: "GCP",
          fontAwesomeClassname: "simple-icons:googlecloud",
          style: {
            color: "#4285F4",
          },
        },
        {
          skillName: "AWS",
          fontAwesomeClassname: "simple-icons:amazonaws",
          style: {
            color: "#FF9900",
          },
        },
        {
          skillName: "Azure",
          fontAwesomeClassname: "simple-icons:microsoftazure",
          style: {
            color: "#0089D6",
          },
        },
        {
          skillName: "Firebase",
          fontAwesomeClassname: "simple-icons:firebase",
          style: {
            color: "#FFCA28",
          },
        },
        {
          skillName: "PostgreSQL",
          fontAwesomeClassname: "simple-icons:postgresql",
          style: {
            color: "#336791",
          },
        },
        {
          skillName: "MongoDB",
          fontAwesomeClassname: "simple-icons:mongodb",
          style: {
            color: "#47A248",
          },
        },
        {
          skillName: "Docker",
          fontAwesomeClassname: "simple-icons:docker",
          style: {
            color: "#1488C6",
          },
        },
        {
          skillName: "Jenkins",
          fontAwesomeClassname: "simple-icons:jenkins",
          style: {
            color: "#cc1104",
          },
        },
        {
          skillName: "Kubernetes",
          fontAwesomeClassname: "simple-icons:kubernetes",
          style: {
            color: "#326CE5",
          },
        },
        {
          skillName: "Terraform",
          fontAwesomeClassname: "simple-icons:terraform",
          style: {
            color: "#5126d1",
          },
        },
        {
          skillName: "Nginx",
          fontAwesomeClassname: "simple-icons:nginx",
          style: {
            color: "#0b850f",
          },
        },
      ],
    },
    {
      title: "Full Stack Development",
      fileName: "FullStackImg",
      skills: [
        "⚡ Building responsive website front end using React",
        "⚡ Developing mobile applications using Flutter, Swift and solo android apps using Java",
        "⚡ Developing Native Windows Desktop apps using WinUI3, MAUI frameworks for .NET",
        "⚡ Creating application backend in Flask, Django & Node",
      ],
      softwareSkills: [
        {
          skillName: "HTML5",
          fontAwesomeClassname: "simple-icons:html5",
          style: {
            color: "#E34F26",
          },
        },
        {
          skillName: "JavaScript",
          fontAwesomeClassname: "simple-icons:javascript",
          style: {
            backgroundColor: "#000000",
            color: "#F7DF1E",
          },
        },
        {
          skillName: "ReactJS",
          fontAwesomeClassname: "simple-icons:react",
          style: {
            color: "#61DAFB",
          },
        },
        {
          skillName: "NodeJS",
          fontAwesomeClassname: "devicon-plain:nodejs-wordmark",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "Django",
          fontAwesomeClassname: "devicon-plain:django",
          style: {
            color: "#339933",
          },
        },
        {
          skillName: "Flask",
          fontAwesomeClassname: "simple-icons:flask",
          style: {
            color: "#010101",
          },
        },
        {
          skillName: "WinUI3/MAUI",
          fontAwesomeClassname: "simple-icons:windows",
          style: {
            color: "#2C8EBB",
          },
        },
        {
          skillName: "C#",
          fontAwesomeClassname: "simple-icons:csharp",
          style: {
            color: "#663399",
          },
        },
        {
          skillName: "Swift",
          fontAwesomeClassname: "devicon-plain:swift",
          style: {
            color: "#d17926",
          },
        },
        {
          skillName: "Android",
          fontAwesomeClassname: "simple-icons:android",
          style: {
            color: "#118538",
          },
        },
        {
          skillName: "Flutter",
          fontAwesomeClassname: "simple-icons:flutter",
          style: {
            color: "#02569B",
          },
        },
      ],
    },
    {
      title: "UI/UX, 3D Modelling, Animation and Editing",
      fileName: "DesignImg",
      skills: [
        "⚡ Designing highly attractive user interface for mobile and web applications",
        "⚡ Creating the flow of application functionalities to optimize user experience",
        "⚡ Creating 3D models and animations with Blender",
        "⚡ Fully functional 2D and 3D Games, XR Apps with Unity and Unreal Engine",
        "⚡ Edit Videos and add animations with Final Cut Pro"
      ],
      softwareSkills: [
        {
          skillName: "Unity",
          fontAwesomeClassname: "simple-icons:unity",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "Unreal Engine",
          fontAwesomeClassname: "simple-icons:unrealengine",
          style: {
            color: "#000000",
          },
        },
        {
          skillName: "Blender",
          fontAwesomeClassname: "simple-icons:blender",
          style: {
            color: "#FE7C00",
          },
        },
        {
          skillName: "Figma",
          fontAwesomeClassname: "simple-icons:figma",
          style: {
            color: "#0017ab",
          },
        },
        {
          skillName: "Sketch",
          fontAwesomeClassname: "simple-icons:sketch",
          style: {
            color: "#ffa930",
          },
        }

      ],
    },
  ],
};

// Education Page
const competitiveSites = {
  competitiveSites: [

  ],
};

const degrees = {
  degrees: [
    {
      title: "Carnegie Mellon University, Pittsburgh",
      subtitle: "Master of Software Engineering - Scalable Systems",
      logo_path: "cmu.png",
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
      logo_path: "vitlogo.png",
      alt_name: "VIT Chennai",
      duration: "2021 - 2026",
      descriptions: [
        "⚡ CGPA: 8.76",
        "⚡ Core Computer engineering subjects like DS, Algorithms, DBMS, OS, CA, AI etc.",
        "⚡ Degree Specialization includes Software Architecture & Design, Software Project Management, Software Contruction & Maintenance, Agile, Scrum etc."
      ],
      website_link: "http://chennai.vit.ac.in",
    },
    {
      title: "Alwin Memorial Public School",
      subtitle: "Higher Secondary",
      logo_path: "amps.png",
      alt_name: "AMPS",
      duration: "2017 - 2021",
      descriptions: [
        "⚡ 12th Grade: 94.8% in CBSE",
        "⚡ 10th Grade: 83.2% in CBSE",
      ],
      website_link: "https://alwinmemorialpublicschool.com/",
    },
  ],
};

const certifications = {
  certifications: [

  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "Work, Internship and Volunteership",
  description:
    "I've worked as an intern at various LLMOps, CloudOps, DevOps, Full Stack Development and other Software Engineering roles. I've also volunteered within my university and at conferences as a developer, designer and mentor.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "AI Infrastructure & Research Intern",
          company: "Vigilnz Inc.",
          company_url: "https://vigilnz.com/",
          logo_path: "Vigilnz_logo.png",
          duration: "August 2025 - Present",
          location: "Chennai, India",
          description:
            "Leading end-to-end AI infrastructure efforts, developing agentic workflows, language models and autonomous pipelines that fuse generative intelligence, adaptive threat modeling, and real-time vulnerability detection to advance next-generation SecOps.",
          color: "#36a0b3",
        },
        {
          title: "Research Intern",
          company: "Centre for Advanced Data Science, VIT Chennai",
          company_url: "https://chennai.vit.ac.in/research/research-centre/centre-for-advanced-data-science/",
          logo_path: "vitlogo.png",
          duration: "Mar 2024 - Nov 2024",
          location: "Chennai, India",
          description:
            "Researching multi-agent on-device scene reconstruction using Paligemma, InternVL, and LLaVA models for graph-based Retrieval-Augmented Generation (RAG) from input videos. Investigated the use of applying the image generation models to generate crime scene images from witness descriptions stored in a Neo4j knowledge graph.",
          color: "#36a0b3",
        },
        {
          title: "CloudOps Intern",
          company: "Automation Anywhere Software Pvt. Ltd.",
          company_url: "https://automationanywhere.com/",
          logo_path: "AA.png",
          duration: "Aug 2023 - Nov 2023",
          location: "Bangalore, India",
          description:
            "Implemented automated IaC (Infrastructure as Code) scanning using Wiz and Env0 to proactively detect and provide actionable insights into security posture from Terraform/Terragrunt templates. Also implemented cost optimization for Cloud Operations on AWS by identifying key expenses on AWS services resulting in substantial cost savings.",
          color: "#36a0b3",
        },
        {
          title: "Software Engineer",
          company: "Impower Centre Pvt. Ltd.",
          company_url: "https://impowercentre.com/",
          logo_path: "impower.png",
          duration: "Jan 2023 - Dec 2023",
          location: "Chennai, India",
          description:
            "Spearheaded the end-to-end development of a comprehensive website for Impower Centre, a multidisciplinary clinic specializing in occupational therapy, speech correction, and behavior correction, catering to patients with such conditions. Managed a cross-functional team of three members, overseeing the entire project lifecycle, from design and development to deployment. Played a pivotal role in client relations, requirement engineering and project management ensuring seamless communication between stakeholders and translating their needs into a feature-rich website.",
          color: "#36a0b3",
        },
        {
          title: "CloudOps Intern",
          company: "Nurtem Inc.",
          company_url: "https://www.nurtem.com/",
          logo_path: "nurtem_logo.jpeg",
          duration: "Aug 2022 - Jan 2023",
          location: "California, USA",
          description:
            "Worked on Terraform, AWS EC2, Kubernetes, Docker containers along with CI/CD pipelines using Spinnaker and Jenkins to automate deployment process of the startup's workflow consisting of ReactJS server, Jenkins Test suite along with Django backend on Google Cloud Platform.",
          color: "#36a0b3",
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
          logo_path: "learningedge.png",
          duration: "Jan 2025 - Present",
          location: "Chennai, India",
          description:
            "Volunteer computer science educator and mentor, dedicated to providing guidance, teaching, and support to underprivileged students from diverse regions around the world, helping them develop essential technical skills, build confidence, and explore opportunities in the field of technology.",
          color: "#000000",
        },
        {
          title: "Secretary",
          company: "Microsoft Innovations Club, VIT Chennai",
          company_url: "https://micvitc.github.io/",
          logo_path: "mic_logo.jpeg",
          duration: "Apr 2023 - Nov 2023",
          location: "Chennai, India",
          description:
            "Organized multiple technical events, conducted interviews. Ideation of multiple innovative project ideas and task allocation to developers and contributors. Proposed and successfully implemented a new organizational structure for the club (200+ members) for the betterment of productivity. Came up with budgeting and marketing ideas to maximize community reach across VIT and other universities.",
          color: "#000000",
        },
        {
          title: "Head of Web Development",
          company: "Microsoft Innovations Club, VIT Chennai",
          company_url: "https://micvitc.github.io/",
          logo_path: "mic_logo.jpeg",
          duration: "Dec 2022 - Apr 2023",
          location: "Chennai, India",
          description:
            "Ideated and Spearheaded management of miscellaneous web development projects used within the club/university and coordinated over 25 team members to achieve completion of projects. Enforced quality standards and code reviews for the various language Tech Stacks and Frameworks used.",
          color: "#000000",
        },
        {
          title: "Technical Volunteer",
          company: "NCVPRIPG, IIT Jodhpur",
          company_url: "https://ncvpripg2024.github.io/",
          logo_path: "iitj.png",
          duration: "2023, 2024 & 2025",
          location: "Remote",
          description:
            "Volunteered for organizing the National Computer Vision conference and contributed to the dataset for the Detection of Pond Fish challenge (2023 and 2024) and Digitization of Handwritten Documents Challenge (2025).",
          color: "#0071C5",
        },
      ],
    }
  ],
};
//


// Research Page
const research = {
  title: "Research",
  subtitle: "Patents and Publications",
  description:
    "I've explored research directions in areas such as artificial intelligence, security, and healthcare, with outcomes shared through peer-reviewed publications and a granted design patent.",
  header_image_path: "research.svg",
  scholarStats: {
    citations: 60,
    hIndex: 3,
    i10Index: 1,
    profileUrl:
      "https://scholar.google.com/citations?user=c3I3YmMAAAAJ&hl=en",
  },
  researchGateStats: {
    interestScore: 27.6,
    citations: 60,
    hIndex: 3,
    profileUrl:
      "https://www.researchgate.net/profile/Akilesh-Srinivasa-Kumar",
  },
  sections: [
    {
      title: "Patents",
      work: true,
      research: [
        {
          title: "Incremental Streaming Binary Scanning",
          company: "United States Patent and Trademark Office",
          company_url: "https://uspto.gov/",
          logo_path: "uspto.jpg",
          duration: "Filed Oct 14, 2025",
          location: "(Provisional) 3/898,766",
          description:
            "Designed a streaming binary scanning system for a wide range of complex data types including images, audio, video, and AI models with minimal memory overhead and high throughput for real-time data processing.",
          color: "#000000",
        },
        {
          title: "Thumb Mounted Trackpad",
          company: "Intellectual Property Office, India",
          company_url: "https://search.ipindia.gov.in/IPOJournal/Journal/Patent",
          logo_path: "ip_office.webp",
          duration: "Issued Mar 29, 2024",
          location: "411985-001",
          description:
            "The thumb-mounted trackpad is a compact and wearable input device designed to fit on the user's thumb, enabling intuitive gesture-based control and improved portability. It offers an alternative to traditional input methods, making it particularly suited for mobile, assistive, and immersive computing environments.",
          color: "#36a0b3",
        },
      ],
    },
    {
      title: "Research Publications",
      research: [
        {
          title: "Zero-Shot Chain-Of-Thought Reasoning For Cryptanalysis Of Popular Ciphers",
          company: "Akilesh Srinivasa Kumar, Rajeev Sekar, Muhammad Kifayathullah, Dr Palani Thanaraj, Dr Christopher Columbus C",
          company_url: "https://doi.org/10.36227/techrxiv.175295517.70390739/v2",
          logo_path: "techrxiv.jpg",
          duration: "",
          location: "TechRxiv",
          description:
            "Explored the use of reasoning-optimized Large Language Models (LLMs) to solve cryptographic ciphers using chain-of-thought techniques, analyzing their performance, reasoning patterns, and limitations across both classical and modern encryption methods.",
          color: "#000000",
        },
        {
          title: "Multi-Agent hierarchical workflow for autonomous code generation with Large Language Models",
          company: "Akilesh Srinivasa Kumar, Rajeev Sekar, Dr Om Kumar C U",
          company_url: "https://doi.org/10.1109/SCEECS64059.2025.10940635",
          logo_path: "ieee_xplore.png",
          duration: "",
          location: "IEEE Xplore",
          description:
            " Developed a multi-agent hierarchical workflow for automating data analysis, code generation, testing, and debugging from CSV inputs, using tools like AlphaCodium, LangChain, LangGraph, and GPT to simulate an autonomous software development pipeline.",
          color: "#000000",
        },
        {
          title: "Medical Diagnosis Through Conversational Intelligence Using Large Language Models",
          company: "Akilesh Srinivasa Kumar, Dr Suganya R, Girish H S",
          company_url: "https://doi.org/10.1007/978-981-97-4711-5_23",
          logo_path: "springer.png",
          duration: "",
          location: "Springer",
          description:
            "Developed a conversational AI system leveraging Large Language Models (LLMs) to facilitate medical diagnosis through natural language interactions. The system engages users in symptom-driven dialogue, generating context-aware follow-up questions and providing preliminary diagnostic insights, with the goal of improving patient communication, reducing diagnostic errors, and supporting clinical decision-making.",
          color: "#000000",
        },
        {
          title: "Graph Based Retrieval-Augmented Generation for Personalized Dietary Guidance with LLMs",
          company: "Akilesh Srinivasa Kumar, Rajeev Sekar, Tulasi Raman R, Dr Suganya R",
          company_url: "https://doi.org/10.1109/SCEECS64059.2025.10940424",
          logo_path: "ieee_xplore.png",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Designed and implemented a personalized dietary recommendation system by integrating graph-based Retrieval-Augmented Generation (RAG) with Large Language Models (LLMs). The system utilizes a GraphDB to represent individual health profiles and nutritional knowledge, enabling context-aware and accurate meal suggestions tailored to user-specific dietary needs. This work highlights the intersection of AI, graph databases, and personalized healthcare solutions.",
          color: "#000000",
        },
        {
          title: "On-Device Input Analysis to Proactively Enhance Data Security in Large Language Models",
          company: "Akilesh Srinivasa Kumar, Abinaya R, Rajeev Sekar,Dr Ganesan R",
          company_url: "https://doi.org/10.1109/AISP61711.2024.10870695",
          logo_path: "ieee_xplore.png",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Developed a proactive data security framework that performs on-device input analysis to identify and filter sensitive information before it reaches Large Language Models (LLMs). The system enhances user privacy and safeguards data integrity by detecting potential security risks in real time, contributing to safer and more responsible deployment of LLM-powered applications.",
          color: "#000000",
        },
        {
          title: "Extended Reality as an Assistive Technology for Patients Suffering from Neurodegenerative Diseases",
          company: "Akilesh Srinivasa Kumar, Sharon John, Tarun Vinod Pai, Dr Sakthivel V, Dr P Prakash",
          company_url: "https://doi.org/10.1109/ICECCE63537.2024.10823464",
          logo_path: "ieee_xplore.png",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Designed an assistive system using Extended Reality (XR) technologies that integrates Unity AR Foundation and OpenCV to provide real-time facial recognition for patients with neurodegenerative conditions. The system enhances patient independence by overlaying digital identifiers on familiar faces within the user's environment, improving social interaction, reducing confusion, and supporting memory recall.",
          color: "#000000",
        },
        {
          title: "EmoGPT: An Emotion-Aware Chatbot with Cause Modeling for Contextual Response Generation",
          company: "Dr Suganya R , Pradhyumn Nair, Akilesh Srinivasa Kumar, Tulasi Raman R, Girish H S",
          company_url: "https://dx.doi.org/10.2139/ssrn.5063888",
          logo_path: "ssrn.jpg",
          duration: "",
          location: "SSRN",
          description:
            "Designed and implemented EmoGPT, an emotion-aware chatbot that integrates emotion cause pair modeling with GPT-2 to generate open-ended, contextually appropriate responses. The system enhances conversational depth and user emotional experience by understanding underlying causes of user sentiments, demonstrating the role of affective computing in human-centered AI applications.",
          color: "#000000",
        },
        {
          title: "Carnatic Raga Recognition Using Deep Learning Techniques",
          company: "Rajeev Sekar, Dr M Poonkodi, K A Muhammad Kifayathullah, Abinaya R & Akilesh Srinivasa Kumar",
          company_url: "https://doi.org/10.1007/978-3-031-82386-2_14",
          logo_path: "springer.png",
          duration: "",
          location: "Springer",
          description:
            "Developed a deep learning-based system for automated raga classification in Carnatic music using audio signal processing and models like ANN, LSTM, and Bi-LSTM, achieving 96.43% accuracy in capturing subtle tonal patterns and gamakas from the CompMusic dataset.",
          color: "#000000",
        },
        {
          title: "A novel AI-based chatbot application for personalized medical diagnosis and review using large language models",
          company: "Akilesh Srinivasa Kumar, Dr Sheik Abdullah A, Abinaya R, Rajeev Sekar, Dhanushkodi S",
          company_url: "https://doi.org/10.1109/RMKMATE59243.2023.10368616",
          logo_path: "ieee_xplore.png",
          duration: "",
          location: "IEEE Xplore",
          description:
            "Developed a Java-based Android chatbot powered by GPT-3.5 to provide users with personalized medical diagnostics through conversational input. The application leverages natural language understanding to interpret symptoms, generate medically relevant insights, and deliver accessible healthcare support, aiming to bridge gaps in preliminary diagnosis and improve patient engagement.",
          color: "#000000",
        },
      ],
    }
  ],
};
//



// Projects Page
const projectsHeader = {
};

const bigProjects = {

};

const publicationsHeader = {

};

const publications = {
  data: [

  ],
};

// Links Page
const links = {
  title: "Links",
  subtitle: "Quick access to my profiles, resume, and work.",
  profile_image_path: "Akilesh_Circle_new_S.png",
  links: [
    {
      name: "Portfolio",
      link: "/home",
      fontAwesomeIcon: "fa-globe",
      fontAwesomeClass: "fas",
      backgroundColor: "#001C55",
    },
    {
      name: "Resume",
      link: greeting.resumeLink,
      fontAwesomeIcon: "fa-file-alt",
      fontAwesomeClass: "fas",
      backgroundColor: "#0E6BA8",
    },
    {
      name: "Google Scholar",
      link: "https://scholar.google.com/citations?user=c3I3YmMAAAAJ&hl=en",
      iconifyIcon: "simple-icons:googlescholar",
      backgroundColor: "#4285F4",
    },
    {
      name: "GitHub",
      link: "https://github.com/itsakilesh",
      fontAwesomeIcon: "fa-github",
      fontAwesomeClass: "fab",
      backgroundColor: "#181717",
    },
    {
      name: "LinkedIn",
      link: "https://www.linkedin.com/in/itsakilesh/",
      fontAwesomeIcon: "fa-linkedin-in",
      fontAwesomeClass: "fab",
      backgroundColor: "#0077B5",
    },
    {
      name: "ORCiD",
      link: "https://orcid.org/0009-0006-7862-0447",
      fontAwesomeIcon: "fa-orcid",
      fontAwesomeClass: "fab",
      backgroundColor: "#457412",
    },
    {
      name: "Email",
      link: "mailto:akilesh.srinivasakumar@gmail.com",
      fontAwesomeIcon: "fa-envelope",
      fontAwesomeClass: "fas",
      backgroundColor: "#349beb",
    },
    {
      name: "Instagram",
      link: "https://www.instagram.com/akilesh.io",
      fontAwesomeIcon: "fa-instagram",
      fontAwesomeClass: "fab",
      backgroundColor: "#E4405F",
    },
    {
      name: "WhatsApp",
      link: "https://wa.me/+14084939366",
      fontAwesomeIcon: "fa-whatsapp",
      fontAwesomeClass: "fab",
      backgroundColor: "#068c59",
    },
    {
      name: "ResearchGate",
      link: "https://www.researchgate.net/profile/Akilesh-Srinivasa-Kumar",
      fontAwesomeIcon: "fa-researchgate",
      fontAwesomeClass: "fab",
      backgroundColor: "#0077B5",
    },
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Get in Touch",
    profile_image_path: "Akilesh_Circle_new_S.png",
    description: "Feel free to reach out via email or follow me on social media using the links below. I'm always happy to help or talk.",
  },

  phoneSection: {
    title: "akilesh.srinivasakumar@gmail.com",
    subtitle: "+14084939366",
  },
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  competitiveSites,
  degrees,
  certifications,
  experience,
  projectsHeader,
  bigProjects,
  publicationsHeader,
  publications,
  research,
  links,
  contactPageData,
};

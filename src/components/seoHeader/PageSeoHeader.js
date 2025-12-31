import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import {
  greeting,
  seo,
  socialMediaLinks,
  experience,
  contactPageData,
  certifications,
  research,
} from "../../portfolio.js";

function PageSeoHeader() {
  const location = useLocation();
  const currentPath = location.pathname;

  // Get page-specific data
  const getPageData = () => {
    switch (currentPath) {
      case "/":
      case "/home":
        return {
          title: `${greeting.title} - Portfolio Home`,
          description: `${greeting.subtitle} - ${greeting.description}`,
          keywords: "Akilesh, Portfolio, Software Developer, Full Stack Developer, Home",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: seo?.og?.url,
            description: greeting.description,
            jobTitle: experience.sections?.find((section) => section.work)?.experiences?.at(0)?.title || "Software Developer",
            worksFor: {
              "@type": "Organization",
              name: experience.sections?.find((section) => section.work)?.experiences?.at(0)?.company || "Freelancer",
            },
            sameAs: socialMediaLinks
              .filter((media) => !(media.link.startsWith("tel") || media.link.startsWith("mailto")))
              .map((media) => media.link),
          },
        };

      case "/experience":
        return {
          title: `${greeting.title} - Experience & Work History`,
          description: `Professional experience and work history of ${greeting.title}. View detailed career progression, roles, and achievements.`,
          keywords: "Akilesh, Experience, Work History, Career, Professional, Software Developer",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: `${seo?.og?.url}/experience`,
            description: "Professional experience and work history",
            hasOccupation: experience.sections?.map((section) => ({
              "@type": "Occupation",
              name: section.title,
              description: section.description,
            })),
          },
        };

      case "/research":
        return {
          title: `${greeting.title} - Research & Publications`,
          description: `Research work and publications by ${greeting.title}. Explore academic contributions and research projects.`,
          keywords: "Akilesh, Research, Publications, Academic, Papers, Studies",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: `${seo?.og?.url}/research`,
            description: "Research work and publications",
            hasCredential: research.sections?.map((section) => ({
              "@type": "EducationalOccupationalCredential",
              name: section.title,
              description: section.description,
            })),
          },
        };

      case "/education":
        return {
          title: `${greeting.title} - Education & Qualifications`,
          description: `Educational background and qualifications of ${greeting.title}. View academic achievements and certifications.`,
          keywords: "Akilesh, Education, Qualifications, Academic, Certifications, Degrees",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: `${seo?.og?.url}/education`,
            description: "Educational background and qualifications",
            hasCredential: certifications.certifications.map((certification) => ({
              "@type": "EducationalOccupationalCredential",
              url: certification.certificate_link,
              name: certification.title,
              description: certification.subtitle,
            })),
          },
        };

      case "/projects":
        return {
          title: `${greeting.title} - Projects & Portfolio`,
          description: `Software development projects and portfolio work by ${greeting.title}. Explore web applications, mobile apps, and technical solutions.`,
          keywords: "Akilesh, Projects, Portfolio, Software Development, Web Applications, Mobile Apps",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: `${seo?.og?.url}/projects`,
            description: "Software development projects and portfolio work",
            knowsAbout: [
              "Software Development",
              "Web Applications", 
              "Mobile Apps",
              "Full Stack Development",
              "React",
              "JavaScript",
              "Python"
            ],
          },
        };

      case "/contact":
        return {
          title: `${greeting.title} - Contact & Get In Touch`,
          description: `Get in touch with ${greeting.title}. Contact information, social media links, and ways to connect.`,
          keywords: "Akilesh, Contact, Get In Touch, Social Media, Email, Phone",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: `${seo?.og?.url}/contact`,
            description: "Contact information and ways to get in touch",
            email: socialMediaLinks.find((media) => media.link.startsWith("mailto"))?.link?.substring("mailto:".length),
            telephone: contactPageData.phoneSection?.subtitle,
            sameAs: socialMediaLinks
              .filter((media) => !(media.link.startsWith("tel") || media.link.startsWith("mailto")))
              .map((media) => media.link),
          },
        };

      default:
        return {
          title: `${greeting.title} - Portfolio`,
          description: `Portfolio website of ${greeting.title}`,
          keywords: "Akilesh, Portfolio, Software Developer",
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Person",
            name: greeting.title,
            url: seo?.og?.url,
          },
        };
    }
  };

  const pageData = getPageData();

  return (
    <Helmet>
      <title>{pageData.title}</title>
      <meta name="description" content={pageData.description} />
      <meta name="keywords" content={pageData.keywords} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={pageData.title} />
      <meta property="og:description" content={pageData.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`${seo?.og?.url}${currentPath}`} />
      <meta property="og:image" content={`${seo?.og?.url}/icons/Akilesh_Circle_new.png`} />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageData.title} />
      <meta name="twitter:description" content={pageData.description} />
      <meta name="twitter:image" content={`${seo?.og?.url}/icons/Akilesh_Circle_new.png`} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`${seo?.og?.url}${currentPath}`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(pageData.structuredData)}</script>
    </Helmet>
  );
}

export default PageSeoHeader;

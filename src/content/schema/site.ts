/**
 * File: site.ts
 * Purpose: Schemas for site-wide content: settings, SEO, the person, social links, interface copy,
 *          analytics, research profiles and project display options.
 * Author: Akilesh
 * Date: 2026-10-21
 */
import { z } from "zod";
import { linkItemSchema } from "./entries";
import { count, flag, icon, image, link, list, longText, text } from "./fields";

export const settingsSchema = z
  .object({
    isSplash: flag({
      title: "Intro splash",
      description: "Shows the name intro once per visit",
    }),
    showDotField: flag({
      title: "Dot field",
      description: "Animated dots behind page headers",
    }),
  })
  .meta({ title: "Settings" });

export const seoSchema = z
  .object({
    title: text({
      title: "Site title",
      description: "Tab and search title; pages prefix it",
    }),
    description: longText({ title: "Description" }),
    author: text({ title: "Author" }),
    keywords: list(text({ title: "Keyword" }), { title: "Keywords" }),
    siteUrl: link({
      title: "Site address",
      description: "Public URL with a trailing slash",
    }),
    language: text({ title: "Language", description: 'e.g. "en-US"' }),
    favicon: text({
      title: "Favicon",
      description: "Path under public/, e.g. icons/me.png",
    }),
    themeColor: text({ title: "Mobile browser colour", widget: "color" }),
    social: z
      .object({
        title: text({
          title: "Preview title",
          description: "Empty uses the site title",
        }),
        description: longText({
          title: "Preview description",
          description: "Empty uses the description",
        }),
        image: text({
          title: "Preview image",
          description: "Path under public/ or an https URL",
        }),
        imageAlt: text({ title: "Preview image description" }),
        twitterCard: z
          .enum(["summary", "summary_large_image"])
          .meta({ title: "X/Twitter card" }),
        twitterHandle: text({
          title: "X/Twitter handle",
          description: 'Without "@"; empty omits it',
        }),
      })
      .meta({ title: "Link previews" }),
    verification: z
      .object({
        google: text({ title: "Google site verification" }),
        bing: text({ title: "Bing site verification" }),
      })
      .meta({
        title: "Search console",
        description: "Empty values are left out",
      }),
    structuredData: z
      .object({
        isEnabled: flag({ title: "schema.org profile data" }),
        jobTitle: text({ title: "Job title" }),
        worksFor: text({ title: "Organisation" }),
      })
      .meta({ title: "Search profile" }),
  })
  .meta({ title: "SEO" });

export const greetingSchema = z
  .object({
    title: text({ title: "Full name" }),
    logo_name: text({ title: "Header name" }),
    nickname: text({ title: "Nickname" }),
    subTitle: longText({ title: "Summary" }),
    resumeLink: link({ title: "Resume link" }),
    resumeLabel: text({ title: "Resume button" }),
    connectLink: link({ title: "Second button link" }),
    connectLabel: text({ title: "Second button" }),
    githubProfile: link({ title: "GitHub profile" }),
  })
  .meta({ title: "Profile" });

export const footerSchema = z
  .object({
    credit: text({ title: "Credit line" }),
    linksLabel: text({ title: "Links shortcut label" }),
    linksPath: link({ title: "Links shortcut target" }),
  })
  .meta({ title: "Footer" });

export const uiSchema = z
  .object({
    readSummary: text({ title: '"Read summary" label' }),
    hideSummary: text({ title: '"Hide summary" label' }),
    allFilter: text({ title: '"All" filter label' }),
    notFoundTitle: text({ title: "Not found title" }),
    notFoundText: longText({ title: "Not found text" }),
    researchCards: z
      .object({
        scholar: text({ title: "Scholar card title" }),
        researchGate: text({ title: "ResearchGate card title" }),
        citations: text({ title: "Citations label" }),
        hIndex: text({ title: "h-index label" }),
        i10Index: text({ title: "i10-index label" }),
        interestScore: text({ title: "Interest score label" }),
      })
      .meta({ title: "Research card labels" }),
  })
  .meta({ title: "Interface copy" });

export const analyticsSchema = z
  .object({
    googleAnalyticsId: text({
      title: "Google Analytics 4 ID",
      description: '"G-..." ; empty disables it',
    }),
    clarityId: text({
      title: "Microsoft Clarity ID",
      description: "Empty disables it",
    }),
  })
  .meta({
    title: "Analytics",
    description: "Loaded only in production builds",
  });

export const researchProfilesSchema = z
  .object({
    scholar: z
      .object({
        citations: count({ title: "Citations" }),
        hIndex: count({ title: "h-index" }),
        i10Index: count({ title: "i10-index" }),
        profileUrl: link({ title: "Profile" }),
      })
      .meta({ title: "Google Scholar" }),
    researchGate: z
      .object({
        interestScore: count({ title: "Interest score" }),
        citations: count({ title: "Citations" }),
        hIndex: count({ title: "h-index" }),
        profileUrl: link({ title: "Profile" }),
      })
      .meta({ title: "ResearchGate" }),
  })
  .meta({
    title: "Research profiles",
    description: "Numbers shown on the research cards",
  });

export const projectOptionsSchema = z
  .object({
    languageIcons: z.record(z.string(), icon({ title: "Icon" })).meta({
      title: "Language icons",
      description: "GitHub language name to icon",
    }),
  })
  .meta({ title: "Projects" });

export const siteSchema = z
  .object({
    settings: settingsSchema,
    seo: seoSchema,
    profile: greetingSchema,
    socialLinks: list(linkItemSchema, { title: "Social links" }),
    footer: footerSchema,
    ui: uiSchema,
    analytics: analyticsSchema,
    researchProfiles: researchProfilesSchema,
    projects: projectOptionsSchema,
    portrait: image({
      title: "Portrait",
      description: "Used by headers that show a photo",
    }),
  })
  .meta({ title: "Site" });

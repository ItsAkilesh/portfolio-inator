/**
 * File: entries.ts
 * Purpose: Schemas for repeated content items: links, skill groups, timeline entries and degrees.
 * Author: Akilesh
 * Date: 2026-10-21 (updated 2026-10-22)
 */
import { z } from "zod";
import {
  dateRange,
  icon,
  image,
  link,
  list,
  longText,
  optionalLink,
  text,
} from "./fields";

export const linkItemSchema = z
  .object({
    name: text({ title: "Name" }),
    link: link({
      title: "Link",
      description: "External URL, mailto:, tel: or a page path",
    }),
    icon: icon({ title: "Icon" }),
  })
  .meta({ title: "Link", summaryKey: "name" });

export const toolSchema = z
  .object({
    skillName: text({ title: "Name" }),
    icon: icon({ title: "Icon" }),
  })
  .meta({ title: "Tool", summaryKey: "skillName" });

export const skillGroupSchema = z
  .object({
    title: text({ title: "Title" }),
    skills: list(longText({ title: "Point" }), { title: "Points" }),
    softwareSkills: list(toolSchema, { title: "Tools" }),
  })
  .meta({ title: "Skill group", summaryKey: "title" });

/** Used for jobs, volunteering, patents and publications alike. */
export const timelineEntrySchema = z
  .object({
    title: text({ title: "Title" }),
    company: text({
      title: "Organisation",
      description: "Company, issuer, or the author list for publications",
    }),
    company_url: optionalLink({ title: "Link" }),
    logo_path: image({ title: "Logo" }),
    dates: dateRange({ title: "Dates" }),
    location: text({
      title: "Location",
      description: "City, or the venue for publications (used as a filter)",
    }),
    description: longText({ title: "Description" }),
  })
  .meta({ title: "Entry", summaryKey: "title" });

export const degreeSchema = z
  .object({
    title: text({ title: "School" }),
    subtitle: text({ title: "Degree" }),
    logo_path: image({ title: "Logo" }),
    alt_name: text({ title: "Short name" }),
    dates: dateRange({ title: "Dates" }),
    descriptions: list(longText({ title: "Point" }), { title: "Points" }),
    website_link: link({ title: "Website" }),
  })
  .meta({ title: "Degree", summaryKey: "title" });

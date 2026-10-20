/**
 * File: index.ts
 * Purpose: The portfolio config. Everything the site shows is defined in this folder and exported here,
 *          the same way src/portfolio.js worked before. Components import only from this module.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import projectData from "../shared/opensource/projects.json";
import { parseProjects } from "../lib/projects";

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  navigation,
  ui,
  analytics,
} from "./site";
export { theme } from "./theme";
export { skills } from "./skills";
export { degrees, educationHeader } from "./education";
export { experience } from "./experience";
export { research } from "./research";
export { links, contactPageData } from "./links";
export { projectsHeader, languageIcons } from "./projects";

/** Validated at the boundary: malformed entries from the fetcher are dropped, not rendered. */
export const projects = parseProjects(projectData);

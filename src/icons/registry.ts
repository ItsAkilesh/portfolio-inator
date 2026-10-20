/**
 * File: registry.ts
 * Purpose: Single registry of brand icons referenced by key from the portfolio config.
 *          To add an icon: import it from simple-icons (https://simpleicons.org) and add a key below.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import {
  siAndroid,
  siBlender,
  siCss,
  siDjango,
  siDocker,
  siFigma,
  siFirebase,
  siFlask,
  siFlutter,
  siGithub,
  siGmail,
  siGnubash,
  siGooglecloud,
  siGooglegemini,
  siGooglescholar,
  siHtml5,
  siInstagram,
  siJavascript,
  siJenkins,
  siJupyter,
  siKubernetes,
  siLangchain,
  siMongodb,
  siNginx,
  siNodedotjs,
  siOllama,
  siOpenjdk,
  siOrcid,
  siPostgresql,
  siPython,
  siPytorch,
  siReact,
  siResearchgate,
  siRust,
  siSketch,
  siSwift,
  siTensorflow,
  siTerraform,
  siTypescript,
  siUnity,
  siUnrealengine,
  siWhatsapp,
} from "simple-icons";
import { CUSTOM_ICONS } from "./customPaths";
import type { IconDefinition } from "./types";

interface SimpleIconLike {
  readonly title: string;
  readonly hex: string;
  readonly path: string;
}

const fromSimple = (icon: SimpleIconLike): IconDefinition => ({
  title: icon.title,
  hex: `#${icon.hex}`,
  path: icon.path,
});

export const ICONS = {
  ...CUSTOM_ICONS,
  android: fromSimple(siAndroid),
  blender: fromSimple(siBlender),
  css: fromSimple(siCss),
  django: fromSimple(siDjango),
  docker: fromSimple(siDocker),
  figma: fromSimple(siFigma),
  firebase: fromSimple(siFirebase),
  flask: fromSimple(siFlask),
  flutter: fromSimple(siFlutter),
  gemini: fromSimple(siGooglegemini),
  github: fromSimple(siGithub),
  gmail: fromSimple(siGmail),
  googlecloud: fromSimple(siGooglecloud),
  googlescholar: fromSimple(siGooglescholar),
  html5: fromSimple(siHtml5),
  instagram: fromSimple(siInstagram),
  java: fromSimple(siOpenjdk),
  javascript: fromSimple(siJavascript),
  jenkins: fromSimple(siJenkins),
  jupyter: fromSimple(siJupyter),
  kubernetes: fromSimple(siKubernetes),
  langchain: fromSimple(siLangchain),
  mongodb: fromSimple(siMongodb),
  nginx: fromSimple(siNginx),
  nodejs: fromSimple(siNodedotjs),
  ollama: fromSimple(siOllama),
  orcid: fromSimple(siOrcid),
  postgresql: fromSimple(siPostgresql),
  python: fromSimple(siPython),
  pytorch: fromSimple(siPytorch),
  react: fromSimple(siReact),
  researchgate: fromSimple(siResearchgate),
  rust: fromSimple(siRust),
  shell: fromSimple(siGnubash),
  sketch: fromSimple(siSketch),
  swift: fromSimple(siSwift),
  tensorflow: fromSimple(siTensorflow),
  terraform: fromSimple(siTerraform),
  typescript: fromSimple(siTypescript),
  unity: fromSimple(siUnity),
  unrealengine: fromSimple(siUnrealengine),
  whatsapp: fromSimple(siWhatsapp),
} as const satisfies Record<string, IconDefinition>;

export type IconKey = keyof typeof ICONS;

export const FALLBACK_ICON: IconKey = "code";

export const isIconKey = (value: unknown): value is IconKey =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(ICONS, value);

export const getIcon = (key: IconKey): IconDefinition => ICONS[key];

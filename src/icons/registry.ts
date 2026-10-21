/**
 * File: registry.ts
 * Purpose: Single registry of brand icons referenced by key from the portfolio config.
 *          To add an icon: import it from simple-icons (https://simpleicons.org) and add a key below.
 * Author: Akilesh
 * Date: 2026-10-20
 */
import {
  siAndroid,
  siApachehadoop,
  siBlender,
  siC,
  siCplusplus,
  siCss,
  siDart,
  siDjango,
  siDocker,
  siDotnet,
  siFigma,
  siFirebase,
  siFlask,
  siFlutter,
  siGithub,
  siGithubactions,
  siGmail,
  siGnubash,
  siGo,
  siGooglecloud,
  siGooglegemini,
  siGooglescholar,
  siGraphql,
  siHelm,
  siHtml5,
  siHuggingface,
  siInstagram,
  siJavascript,
  siJenkins,
  siJupyter,
  siKubernetes,
  siLangchain,
  siLanggraph,
  siMlflow,
  siModelcontextprotocol,
  siMongodb,
  siNeo4j,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siNumpy,
  siOllama,
  siOpencv,
  siOpenjdk,
  siOpentelemetry,
  siOrcid,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siReact,
  siRedis,
  siResearchgate,
  siRuby,
  siRust,
  siSailsdotjs,
  siSketch,
  siSwift,
  siTensorflow,
  siTerraform,
  siTypescript,
  siUnity,
  siUnrealengine,
  siWebrtc,
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
  c: fromSimple(siC),
  cplusplus: fromSimple(siCplusplus),
  css: fromSimple(siCss),
  dart: fromSimple(siDart),
  django: fromSimple(siDjango),
  docker: fromSimple(siDocker),
  dotnet: fromSimple(siDotnet),
  figma: fromSimple(siFigma),
  firebase: fromSimple(siFirebase),
  flask: fromSimple(siFlask),
  flutter: fromSimple(siFlutter),
  gemini: fromSimple(siGooglegemini),
  github: fromSimple(siGithub),
  githubactions: fromSimple(siGithubactions),
  gmail: fromSimple(siGmail),
  go: fromSimple(siGo),
  googlecloud: fromSimple(siGooglecloud),
  googlescholar: fromSimple(siGooglescholar),
  graphql: fromSimple(siGraphql),
  hadoop: fromSimple(siApachehadoop),
  helm: fromSimple(siHelm),
  html5: fromSimple(siHtml5),
  huggingface: fromSimple(siHuggingface),
  instagram: fromSimple(siInstagram),
  java: fromSimple(siOpenjdk),
  javascript: fromSimple(siJavascript),
  jenkins: fromSimple(siJenkins),
  jupyter: fromSimple(siJupyter),
  kubernetes: fromSimple(siKubernetes),
  langchain: fromSimple(siLangchain),
  langgraph: fromSimple(siLanggraph),
  mcp: fromSimple(siModelcontextprotocol),
  mlflow: fromSimple(siMlflow),
  mongodb: fromSimple(siMongodb),
  neo4j: fromSimple(siNeo4j),
  nextjs: fromSimple(siNextdotjs),
  nginx: fromSimple(siNginx),
  nodejs: fromSimple(siNodedotjs),
  numpy: fromSimple(siNumpy),
  ollama: fromSimple(siOllama),
  opencv: fromSimple(siOpencv),
  opentelemetry: fromSimple(siOpentelemetry),
  orcid: fromSimple(siOrcid),
  pandas: fromSimple(siPandas),
  postgresql: fromSimple(siPostgresql),
  python: fromSimple(siPython),
  pytorch: fromSimple(siPytorch),
  react: fromSimple(siReact),
  redis: fromSimple(siRedis),
  researchgate: fromSimple(siResearchgate),
  ruby: fromSimple(siRuby),
  rust: fromSimple(siRust),
  sailsjs: fromSimple(siSailsdotjs),
  shell: fromSimple(siGnubash),
  sketch: fromSimple(siSketch),
  swift: fromSimple(siSwift),
  tensorflow: fromSimple(siTensorflow),
  terraform: fromSimple(siTerraform),
  typescript: fromSimple(siTypescript),
  unity: fromSimple(siUnity),
  unrealengine: fromSimple(siUnrealengine),
  webrtc: fromSimple(siWebrtc),
  whatsapp: fromSimple(siWhatsapp),
} as const satisfies Record<string, IconDefinition>;

export type IconKey = keyof typeof ICONS;

export const FALLBACK_ICON: IconKey = "code";

export const isIconKey = (value: unknown): value is IconKey =>
  typeof value === "string" &&
  Object.prototype.hasOwnProperty.call(ICONS, value);

export const getIcon = (key: IconKey): IconDefinition => ICONS[key];

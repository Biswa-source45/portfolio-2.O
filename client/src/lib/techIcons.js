import {
  siBootstrap,
  siClaude,
  siCss,
  siCursor,
  siDocker,
  siExpress,
  siFastapi,
  siFirebase,
  siFramer,
  siGit,
  siGithubactions,
  siGooglegemini,
  siGreensock,
  siHtml5,
  siJavascript,
  siLangchain,
  siLanggraph,
  siModelcontextprotocol,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siRedux,
  siRender,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
} from 'simple-icons';

// Brand icons for marquee words, keyed by a normalised name
// ("Next.js" -> "nextjs", "Tailwind CSS" -> "tailwindcss").
const ICONS = {
  bootstrap: siBootstrap,
  claude: siClaude,
  claudecode: siClaude,
  css: siCss,
  cursor: siCursor,
  docker: siDocker,
  express: siExpress,
  expressjs: siExpress,
  fastapi: siFastapi,
  firebase: siFirebase,
  framer: siFramer,
  framermotion: siFramer,
  git: siGit,
  githubactions: siGithubactions,
  gemini: siGooglegemini,
  gsap: siGreensock,
  html: siHtml5,
  javascript: siJavascript,
  js: siJavascript,
  langchain: siLangchain,
  langgraph: siLanggraph,
  mcp: siModelcontextprotocol,
  mongodb: siMongodb,
  mysql: siMysql,
  nextjs: siNextdotjs,
  next: siNextdotjs,
  nodejs: siNodedotjs,
  node: siNodedotjs,
  postgresql: siPostgresql,
  postman: siPostman,
  python: siPython,
  react: siReact,
  reactjs: siReact,
  redux: siRedux,
  render: siRender,
  supabase: siSupabase,
  tailwind: siTailwindcss,
  tailwindcss: siTailwindcss,
  typescript: siTypescript,
  vercel: siVercel,
  vite: siVite,
};

// simple-icons ships some brands in colours too pale to read on the cream
// tiles; these use the darker colour from the brand's own logo instead.
const COLOR_OVERRIDES = { langchain: '1C3C3C', langgraph: '1C3C3C' };

// Hand-drawn marks for things simple-icons doesn't cover. Each icon is a list
// of SVG paths on a 24x24 grid.
const CUSTOM = {
  // Chroma: two overlapping circles with the lens between them in red.
  chromadb: [
    { d: 'M9 5.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13Z', fill: '#FFDE2D' },
    { d: 'M15 5.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13Z', fill: '#327EFF' },
    { d: 'M12 6.234A6.5 6.5 0 0 1 12 17.766A6.5 6.5 0 0 1 12 6.234Z', fill: '#FF6446' },
  ],
  // RAG (retrieval-augmented generation): a document being searched.
  rag: [
    { d: 'M6 2.75h7.5l4.25 4.25v5.25M10 21.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75', stroke: '#7C3AED', strokeWidth: 1.7 },
    { d: 'M13.5 2.75V7h4.25M8 10h6M8 13.5h3', stroke: '#7C3AED', strokeWidth: 1.7 },
    { d: 'M16 13.25a3.25 3.25 0 1 0 0 6.5a3.25 3.25 0 1 0 0-6.5ZM18.4 19.4l2.6 2.6', stroke: '#14110D', strokeWidth: 1.8 },
  ],
};
CUSTOM.chroma = CUSTOM.chromadb;

// Returns a list of SVG paths ({ d, fill } or { d, stroke, strokeWidth }) for a
// tech name, or null when there is no icon for it.
export function getTechIcon(name) {
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (CUSTOM[key]) return CUSTOM[key];
  const icon = ICONS[key];
  return icon ? [{ d: icon.path, fill: `#${COLOR_OVERRIDES[key] || icon.hex}` }] : null;
}

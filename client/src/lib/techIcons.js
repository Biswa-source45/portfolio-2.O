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

// LangChain and LangGraph marks: navy rounded square with the light-blue
// symbol, paths taken from the official logos in the langchain-ai repos.
const LANG_TILE = { d: 'M20 0h60a20 20 0 0 1 20 20v60a20 20 0 0 1-20 20H20A20 20 0 0 1 0 80V20A20 20 0 0 1 20 0Z', fill: '#161F34' };

// Hand-drawn or official marks for things simple-icons doesn't cover (or
// covers without the brand's own presentation).
const CUSTOM = {
  langchain: {
    viewBox: '0 0 100 100',
    paths: [
      LANG_TILE,
      { d: 'M54.2612 54.2583L63.1942 45.3253C67.8979 40.6215 67.8979 32.9952 63.1942 28.2914C58.4904 23.5877 50.8641 23.5877 46.1603 28.2914L37.2273 37.2244', stroke: '#7FC8FF', strokeWidth: 12.0389, round: false },
      { d: 'M45.7427 45.7411L36.8098 54.6741C32.106 59.3779 32.106 67.0042 36.8098 71.7079C41.5135 76.4117 49.1398 76.4117 53.8436 71.7079L62.7766 62.775', stroke: '#7FC8FF', strokeWidth: 12.0389, round: false },
    ],
  },
  langgraph: {
    viewBox: '0 0 100 100',
    paths: [
      LANG_TILE,
      {
        d: 'M32.1494 67.8578H45.2266C45.2246 75.0776 39.3716 80.9299 32.1514 80.9301C24.9301 80.9299 19.0756 75.0761 19.0752 67.8549C19.0752 60.634 24.9288 54.7799 32.1494 54.7787V67.8578ZM67.8691 54.7787C75.0906 54.7789 80.9443 60.6334 80.9443 67.8549C80.944 75.076 75.0904 80.9299 67.8691 80.9301C60.6488 80.9299 54.7949 75.0777 54.793 67.8578H67.8594V54.7787C67.8626 54.7787 67.8659 54.7787 67.8691 54.7787ZM67.8691 19.0756C75.0906 19.0758 80.9443 24.9303 80.9443 32.1517C80.944 39.373 75.0904 45.2267 67.8691 45.2269C67.8659 45.2269 67.8626 45.226 67.8594 45.226V32.1478H54.793C54.795 24.928 60.6489 19.0757 67.8691 19.0756ZM32.1514 19.0756C39.3716 19.0757 45.2246 24.928 45.2266 32.1478H32.1494V45.226C24.929 45.2248 19.0755 39.3724 19.0752 32.1517C19.0752 24.9302 24.9299 19.0757 32.1514 19.0756Z',
        fill: '#7FC8FF',
      },
    ],
  },
  // Chroma: two overlapping circles with the lens between them in red.
  chromadb: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M9 5.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13Z', fill: '#FFDE2D' },
      { d: 'M15 5.5a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13Z', fill: '#327EFF' },
      { d: 'M12 6.234A6.5 6.5 0 0 1 12 17.766A6.5 6.5 0 0 1 12 6.234Z', fill: '#FF6446' },
    ],
  },
  // RAG (retrieval-augmented generation): a document being searched.
  rag: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M6 2.75h7.5l4.25 4.25v5.25M10 21.25H6A1.25 1.25 0 0 1 4.75 20V4A1.25 1.25 0 0 1 6 2.75', stroke: '#7C3AED', strokeWidth: 1.7 },
      { d: 'M13.5 2.75V7h4.25M8 10h6M8 13.5h3', stroke: '#7C3AED', strokeWidth: 1.7 },
      { d: 'M16 13.25a3.25 3.25 0 1 0 0 6.5a3.25 3.25 0 1 0 0-6.5ZM18.4 19.4l2.6 2.6', stroke: '#14110D', strokeWidth: 1.8 },
    ],
  },
};
CUSTOM.chroma = CUSTOM.chromadb;

// Returns { viewBox, paths } for a tech name, where each path is { d, fill }
// or { d, stroke, strokeWidth }, or null when there is no icon for it.
export function getTechIcon(name) {
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (CUSTOM[key]) return CUSTOM[key];
  const icon = ICONS[key];
  return icon ? { viewBox: '0 0 24 24', paths: [{ d: icon.path, fill: `#${icon.hex}` }] } : null;
}

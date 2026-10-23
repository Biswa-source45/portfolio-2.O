// Content taken from the original static portfolio (Biswa-source45/portfolio-2.O).
export const profile = {
  name: 'Biswabhusan Sahoo',
  nickname: 'Biswa',
  role: 'Full-Stack Developer',
  headline:
    'Full-stack developer building production Generative & Agentic AI systems: real-time voice agents, RAG pipelines, LLM document automation, and the products around them.',
  about:
    "I'm a full-stack developer building production Generative AI and Agentic AI systems — real-time voice agents, RAG pipelines and LLM-powered document automation. I'm full-stack too: React, Next.js and Node.js, shipping REST and WebSocket APIs, webhooks and secure web apps end to end.",
  location: 'Bhubaneswar, Odisha',
  email: 'biswabhusansahoo2005@gmail.com',
  photo: '/photo.jpg',
  availability: 'Open to AI engineering & full-stack roles',
  socials: {
    github: 'https://github.com/Biswa-source45',
    linkedin: 'https://www.linkedin.com/in/biswabhusan-sahoo-22b704292/',
  },
  stats: [
    { value: 95, suffix: '%+', label: 'Extraction accuracy on unstructured documents, replacing manual data entry.' },
    { value: 99, suffix: '%', label: 'Of the internal team adopted the async microservices I architected.' },
    { value: 2, suffix: '×', label: 'First place — a college project expo and a college hackathon.' },
  ],
  education: [
    { kind: 'Education', title: 'Bachelor of Computer Applications', place: 'Utkal University · Bhubaneswar, Odisha' },
    { kind: 'Higher secondary', title: '+2 Science (PCMB)', place: 'Maharishi College of Natural Law · Bhubaneswar' },
    { kind: 'Certifications', title: 'IBM · Udemy · HackerRank', place: 'Getting Started with AI · Data Science using Python · Python, JavaScript, CSS' },
  ],
  languages: ['English', 'Hindi', 'Odia (native)'],
  marquee: ['Python', 'FastAPI', 'LangChain', 'LangGraph', 'RAG', 'MCP', 'React', 'Next.js', 'Node.js', 'MongoDB', 'ChromaDB', 'Tailwind CSS', 'Framer Motion'],
  ai: {
    enabled: true,
    greeting: "Hi! I'm Biswa's AI assistant. Ask me anything about his work, skills or experience.",
    suggestions: ['What is he working on right now?', 'Tell me about PathFinder-AI', 'What is his tech stack?', 'How can I contact him?'],
    extraContext: 'He enjoys chai, is open to freelance builds, and is curious about remote roles.',
  },
};

export const experience = [
  {
    company: 'GlobX System & Network Pvt. Ltd.',
    role: 'Full-Stack Developer',
    period: 'May 2026 — Present',
    location: 'Bhubaneswar, Odisha',
    current: true,
    order: 0,
    highlights: [
      { title: 'Enterprise AI voice agents', text: 'Leading development of real-time agents: a FastAPI WebSocket layer for audio streaming and a GPT-4o-mini reasoning layer orchestrated through a Model Context Protocol server for context-aware, tool-using responses.' },
      { title: 'Agentic document automation', text: 'An LLM pipeline built on LangChain, prompt engineering and structured outputs that extracts data from unstructured documents with 95%+ accuracy, replacing manual entry.' },
      { title: 'Bulk tender import', text: 'A module that migrates tenders from the legacy GBX Tracker spreadsheet into the OneTrack bid-management system, mapping each bid to its correct lifecycle stage and validating before import.' },
      { title: 'Async microservices', text: 'Modular asynchronous services with third-party API integrations and workflow orchestration — adopted by 99% of the internal team, cutting manual operational effort.' },
    ],
  },
];

export const projects = [
  {
    title: 'Enterprise AI Voice Agent',
    subtitle: 'Real-time, tool-using voice assistant',
    category: 'Work · GlobX',
    description: 'A FastAPI WebSocket layer streams audio in real time while a GPT-4o-mini reasoning layer, orchestrated through a Model Context Protocol server, returns context-aware, tool-using responses.',
    tags: ['FastAPI', 'WebSocket', 'GPT-4o-mini', 'MCP'],
    note: 'Internal enterprise project',
    order: 0,
  },
  {
    title: 'PathFinder-AI',
    subtitle: 'Resume evaluator & roadmap generator',
    category: 'AI platform',
    description: 'Scores resumes against job descriptions and returns compatibility scores, skill-gap analysis and learning roadmaps. A RAG pipeline on ChromaDB embeddings, multi-step evaluation as LangGraph agentic workflows, and a modular FastAPI backend on OpenRouter so models swap without code changes.',
    tags: ['FastAPI', 'React', 'LangGraph', 'LangChain', 'ChromaDB'],
    repoUrl: 'https://github.com/Biswa-source45',
    order: 1,
  },
  {
    title: 'StackSprint',
    subtitle: 'Educational management platform',
    category: 'Client project',
    description: 'A full-stack platform for student, resource and fee management with role-based access control and admin/student dashboards. Backend event triggers automate bulk messages, fee reminders and updates over SMTP.',
    tags: ['React', 'Node.js', 'Express', 'MySQL', 'SMTP'],
    liveUrl: '',
    order: 2,
  },
];

export const skills = [
  { title: 'Languages', items: ['Python', 'JavaScript', 'SQL'] },
  { title: 'AI & GenAI', items: ['LangChain', 'LangGraph', 'RAG', 'AI Agents', 'Agentic Workflows', 'MCP'] },
  { title: 'AI coding tools', items: ['Claude Code', 'Cursor', 'Google Antigravity'] },
  { title: 'Backend', items: ['FastAPI', 'Node.js', 'Express.js', 'REST APIs', 'Microservices', 'SMTP'] },
  { title: 'Frontend', items: ['React.js', 'Next.js', 'Redux', 'Tailwind CSS', 'Framer Motion', 'Bootstrap'] },
  { title: 'Databases', items: ['MySQL', 'MongoDB', 'ChromaDB', 'Supabase', 'Firebase'] },
  { title: 'Cloud & DevOps', items: ['Git', 'GitHub Actions', 'Vercel', 'Render', 'Postman', 'VS Code'] },
].map((s, i) => ({ ...s, order: i }));

export const achievements = [
  { rank: '1st', title: 'College Project Expo', description: 'Built AI agents for an ERP system with FastAPI, LangGraph, ChromaDB and LLM workflows — plus the frontend landing site.', order: 0 },
  { rank: '1st', title: 'College Hackathon', description: 'Led the backend of a code-practice platform: Monaco Editor, Piston API for code execution, FastAPI and a React frontend.', order: 1 },
];

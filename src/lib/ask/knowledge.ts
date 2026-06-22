export type Entry = {
  /** Stable id (used internally for matching + tests). */
  id: string;
  /** Several phrasings of the same question — each is embedded; the best match wins. */
  questions: string[];
  /** The curated answer, returned verbatim. Plain text, no PII. */
  answer: string;
};

/**
 * Cosine-similarity cut-off for "good enough" matches (normalized MiniLM embeddings).
 * Below this, `ask` gives the honest-redirect line instead of a wrong answer.
 * Tuned during browser QA.
 */
export const MATCH_THRESHOLD = 0.45;

export const knowledge: Entry[] = [
  {
    id: 'about',
    questions: [
      'who are you',
      'tell me about yourself',
      'introduce yourself',
      'who is rodrigo',
      'what is your name',
    ],
    answer:
      "I'm Rodrigo S. Calderon — a Full-Stack AI Engineer based in Miami. I build AI-powered products end to end, from streaming backends and data pipelines to polished web and mobile front ends. Before engineering I was a management consultant and a chief of staff, so I tend to think about the product and the business around it together.",
  },
  {
    id: 'role',
    questions: [
      'what do you do',
      'what is your job',
      'what is your role',
      'what kind of engineer are you',
      'are you frontend or backend',
    ],
    answer:
      "I'm a full-stack engineer with an AI focus — comfortable across the whole stack, from infrastructure and data pipelines to React and React Native interfaces. Most recently I've worked as a product engineer and as a founding engineer at early-stage startups.",
  },
  {
    id: 'location',
    questions: [
      'where are you based',
      'where do you live',
      'what city are you in',
      'where are you located',
      'are you in Miami',
    ],
    answer: "I'm based in Miami.",
  },
  {
    id: 'background',
    questions: [
      'what is your background',
      'tell me about your career',
      'how did you get into engineering',
      'what is your career path',
      'what did you do before engineering',
    ],
    answer:
      'I started in management consulting at EY-Parthenon (growth strategy), then was Chief of Staff to a CEO at Lactolac, before moving into software engineering. Since 2023 I have worked as a software, founding, and product engineer across several startups.',
  },
  {
    id: 'current',
    questions: [
      'where do you work now',
      'what is your latest role',
      'what are you working on',
      'tell me about Wander',
      'what was your most recent job',
    ],
    answer:
      'Most recently I was a Product Engineer at Wander, where I built a near-real-time clickstream analytics pipeline (Google Cloud Run, Kafka, Confluent Schema Registry, Cube), shipped onboarding and host-dashboard experiences for WanderOS, and replaced an LLM-as-judge property evaluator with an XGBoost model at roughly 10x lower latency and near-zero inference cost.',
  },
  {
    id: 'tatem',
    questions: ['tell me about Tatem', 'what did you do at Tatem', 'what is Tatem'],
    answer:
      'At Tatem — a fast email client, later acquired by Wander — I was a founding engineer. I built a web-worker transaction queue over SQLite OPFS that survived a 100k-transaction stress test with zero failures, drove sub-100ms interactions with TanStack Query optimistic UI, and built the Tiptap-based editor used in 100% of sent mail.',
  },
  {
    id: 'aria',
    questions: ['tell me about Aria', 'what did you do at Aria Music', 'what is Aria'],
    answer:
      'At Aria Music I was a founding engineer. I built an MP3/FLAC/WAV to AAC+HLS audio streaming pipeline on AWS Lambda (Python + ffmpeg) that cut time-to-playback to under 300ms at about 10% of the cost of AWS Elemental MediaConvert, and shipped artist dashboards, automated payouts, and the web and mobile apps with React, React Native, and Nest.js.',
  },
  {
    id: 'codesmith',
    questions: ['tell me about Codesmith', 'what did you do at Codesmith', 'what is CS Engineering'],
    answer:
      'At CS Engineering (Codesmith) I was a software engineer — I cut about 80% of the modal code in an RBAC admin dashboard, migrated the Codesmith public site (200k+ annual visitors) from class to functional React, and raised test coverage with Jest and React Testing Library in CI.',
  },
  {
    id: 'consulting',
    questions: [
      'were you a consultant',
      'tell me about your consulting',
      'what did you do at EY-Parthenon',
      'what did you do at Lactolac',
      'were you a chief of staff',
    ],
    answer:
      'Before engineering: at EY-Parthenon I advised corporate, government, and private-equity clients on growth strategy and due diligence. At Lactolac I was Chief of Staff to the CEO — I led a 15-person cross-functional team to a workplace-standards certification worth $1M+ in annual revenue and ran a digital transformation that saved 1,000+ supervisor-hours a year.',
  },
  {
    id: 'education',
    questions: [
      'where did you study',
      'what is your education',
      'where did you go to school',
      'what degrees do you have',
      'did you go to college',
    ],
    answer:
      "I'm pursuing a Master's of Applied Science in Computer Science at the University of Pennsylvania (in progress). I hold a B.S. in Business from UC Berkeley, and I did coursework in Electrical & Computer Engineering and Accounting at Carnegie Mellon.",
  },
  {
    id: 'skills',
    questions: [
      'what is your tech stack',
      'what technologies do you use',
      'what languages do you know',
      'what tools do you use',
      'what do you build with',
    ],
    answer:
      'Mostly TypeScript across the stack: React, Next.js, Node, React Native, and TanStack on the front; Nest, Hono, and Express on the back. I work with AWS and Google Cloud, Postgres, SQLite/OPFS, Redis, Kafka, and Docker, and I also use Python. Comfortable with CI/CD and testing (Jest, Cypress, React Testing Library, Maestro).',
  },
  {
    id: 'ai',
    questions: [
      'what is your AI experience',
      'do you do AI',
      'tell me about your AI work',
      'what AI tools do you use',
      'are you an AI engineer',
    ],
    answer:
      'AI is the through-line of my work. I build with coding agents (Claude Code, Codex, Cursor), the Model Context Protocol, and the Vercel AI SDK; I write evals and instrument observability with Braintrust; and I have shipped ML in production, like swapping an LLM-as-judge evaluator for a faster XGBoost model. This page itself runs a small model in your browser to answer you.',
  },
  {
    id: 'writing',
    questions: [
      'do you write',
      'where can I read your writing',
      'do you have a blog',
      'tell me about your essays',
      'do you blog',
    ],
    answer: "I write essays on Medium. Run the `writing` command and I'll point you there.",
  },
  {
    id: 'contact',
    questions: [
      'how can I contact you',
      'how do I reach you',
      'what is your email',
      'can I get your contact info',
      'how do I get in touch',
      'what is your phone number',
    ],
    answer:
      'Run the `contact` command for my details and a downloadable vCard, or `links` to find me on LinkedIn, GitHub, and Medium.',
  },
  {
    id: 'availability',
    questions: [
      'are you available',
      'are you open to work',
      'are you looking for a job',
      'can I hire you',
      'are you for hire',
    ],
    answer:
      'I am open to interesting opportunities. The best way to start a conversation is the `contact` command, or a message on LinkedIn (run `links`).',
  },
  {
    id: 'why-terminal',
    questions: [
      'why is your site a terminal',
      'why a terminal',
      'what is this',
      'how does this site work',
      'why does this work like a command line',
    ],
    answer:
      "Because it's more fun than a static page — calm on the surface, with a little reward for curiosity. Type `help` to see everything it can do. And `ask` (this) runs a small language model entirely in your browser, no server, to match your question to answers I've written.",
  },
];

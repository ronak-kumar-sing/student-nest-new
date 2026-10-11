export type SkillCategory =
  | 'Languages'
  | 'Frameworks'
  | 'Styling & UI'
  | 'State & Data'
  | 'Motion & 3D';

export type ProficiencyLevel = 'Core' | 'Advanced' | 'Working';

export interface Skill {
  name: string;
  slug: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  yearsOrContext: string;
  versionOrDetail?: string;
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Languages',
  'Frameworks',
  'Styling & UI',
  'State & Data',
  'Motion & 3D',
];

export const SKILLS_DATA: Skill[] = [
  // Languages
  {
    name: 'TypeScript',
    slug: 'typescript',
    category: 'Languages',
    proficiency: 'Core',
    yearsOrContext: 'Primary language for type-safe applications, strict mode & generics',
    versionOrDetail: 'v5+',
  },
  {
    name: 'JavaScript',
    slug: 'javascript',
    category: 'Languages',
    proficiency: 'Core',
    yearsOrContext: 'ESNext features, async concurrency, DOM APIs & event loops',
    versionOrDetail: 'ES2024',
  },
  {
    name: 'HTML5',
    slug: 'html5',
    category: 'Languages',
    proficiency: 'Core',
    yearsOrContext: 'Semantic document structure, Web Accessibility (WCAG AA), SEO meta',
    versionOrDetail: 'Standards',
  },
  {
    name: 'CSS3',
    slug: 'css3',
    category: 'Languages',
    proficiency: 'Core',
    yearsOrContext: 'Modern layout primitives (Subgrid, Flexbox, Container Queries)',
    versionOrDetail: 'Modern CSS',
  },

  // Frameworks
  {
    name: 'React.js',
    slug: 'react',
    category: 'Frameworks',
    proficiency: 'Core',
    yearsOrContext: 'React 19, Server Components, custom hook abstractions, Suspense boundaries',
    versionOrDetail: 'v19',
  },
  {
    name: 'Next.js',
    slug: 'nextdotjs',
    category: 'Frameworks',
    proficiency: 'Core',
    yearsOrContext: 'App Router, Server Actions, Route Handlers & Edge Middleware',
    versionOrDetail: 'v15',
  },

  // Styling & UI
  {
    name: 'Tailwind CSS',
    slug: 'tailwindcss',
    category: 'Styling & UI',
    proficiency: 'Core',
    yearsOrContext: 'Design token architecture, @theme configurations & utility ergonomics',
    versionOrDetail: 'v4',
  },
  {
    name: 'shadcn/ui',
    slug: 'shadcnui',
    category: 'Styling & UI',
    proficiency: 'Advanced',
    yearsOrContext: 'Accessible component assembly built atop headless Radix UI primitives',
    versionOrDetail: 'New York',
  },
  {
    name: 'Responsive Design',
    slug: 'responsive-design',
    category: 'Styling & UI',
    proficiency: 'Core',
    yearsOrContext: 'Fluid layouts, clamp-based typography, mobile-first touch ergonomics',
    versionOrDetail: 'Adaptive',
  },
  {
    name: 'UI/UX Architecture',
    slug: 'ui-ux',
    category: 'Styling & UI',
    proficiency: 'Advanced',
    yearsOrContext: 'Micro-interactions, state feedback, color contrast & cognitive pacing',
    versionOrDetail: 'HCI',
  },

  // State & Data
  {
    name: 'REST APIs & Fetch',
    slug: 'rest-api',
    category: 'State & Data',
    proficiency: 'Core',
    yearsOrContext: 'Contract validation via Zod, optimistic mutations & resilient caching',
    versionOrDetail: 'RESTful',
  },
  {
    name: 'Redux Toolkit',
    slug: 'redux',
    category: 'State & Data',
    proficiency: 'Working',
    yearsOrContext: 'RTK slices, normalized state shape & predictable dispatch flows',
    versionOrDetail: 'RTK',
  },

  // Motion & 3D
  {
    name: 'Framer Motion',
    slug: 'framer-motion',
    category: 'Motion & 3D',
    proficiency: 'Advanced',
    yearsOrContext: 'Physics springs, layout transitions, exit choreography & reduced-motion',
    versionOrDetail: 'v12',
  },
  {
    name: 'GSAP',
    slug: 'greensock',
    category: 'Motion & 3D',
    proficiency: 'Advanced',
    yearsOrContext: 'Complex timeline sequencing, ScrollTrigger scrubbing & SVG morphing',
    versionOrDetail: 'v3.14',
  },
  {
    name: 'Three.js',
    slug: 'threedotjs',
    category: 'Motion & 3D',
    proficiency: 'Working',
    yearsOrContext: 'WebGL scene graph, interactive camera controls & shader foundations',
    versionOrDetail: 'r160',
  },
];

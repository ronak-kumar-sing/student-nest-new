import * as React from 'react';
import {
  SiTypescript,
  SiJavascript,
  SiHtml5,
  SiCss,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiShadcnui,
  SiRedux,
  SiFramer,
  SiGreensock,
  SiThreedotjs,
} from 'react-icons/si';
import { Layout, Palette, ArrowRightLeft, Code2 } from 'lucide-react';

interface TechIconProps {
  slug: string;
  className?: string;
}

export function TechIcon({ slug, className = 'w-4 h-4' }: TechIconProps) {
  switch (slug) {
    case 'typescript':
      return <SiTypescript className={className} aria-hidden="true" />;
    case 'javascript':
      return <SiJavascript className={className} aria-hidden="true" />;
    case 'html5':
      return <SiHtml5 className={className} aria-hidden="true" />;
    case 'css3':
      return <SiCss className={className} aria-hidden="true" />;
    case 'react':
      return <SiReact className={className} aria-hidden="true" />;
    case 'nextdotjs':
      return <SiNextdotjs className={className} aria-hidden="true" />;
    case 'tailwindcss':
      return <SiTailwindcss className={className} aria-hidden="true" />;
    case 'shadcnui':
      return <SiShadcnui className={className} aria-hidden="true" />;
    case 'responsive-design':
      return <Layout className={className} aria-hidden="true" />;
    case 'ui-ux':
      return <Palette className={className} aria-hidden="true" />;
    case 'rest-api':
      return <ArrowRightLeft className={className} aria-hidden="true" />;
    case 'redux':
      return <SiRedux className={className} aria-hidden="true" />;
    case 'framer-motion':
      return <SiFramer className={className} aria-hidden="true" />;
    case 'greensock':
      return <SiGreensock className={className} aria-hidden="true" />;
    case 'threedotjs':
      return <SiThreedotjs className={className} aria-hidden="true" />;
    default:
      return <Code2 className={className} aria-hidden="true" />;
  }
}

'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'framer-motion';
import { SKILLS_DATA, SKILL_CATEGORIES, type SkillCategory } from './skills-data';
import { SkillTabs } from './SkillTabs';
import { SkillRow } from './SkillRow';

interface SkillsSectionProps {
  className?: string;
}

export function SkillsSection({ className = '' }: SkillsSectionProps) {
  const [activeCategory, setActiveCategory] = React.useState<SkillCategory>('Languages');
  const shouldReduceMotion = useReducedMotion();

  // Pre-calculate count per category
  const categoryCounts = React.useMemo(() => {
    return SKILL_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = SKILLS_DATA.filter((s) => s.category === cat).length;
      return acc;
    }, {} as Record<SkillCategory, number>);
  }, []);

  // Filter skills for active category
  const currentSkills = React.useMemo(() => {
    return SKILLS_DATA.filter((s) => s.category === activeCategory);
  }, [activeCategory]);

  // Motion variants with reduced-motion support
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.04,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className={`w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      {/* Header with clear typographical hierarchy */}
      <div className="flex flex-col gap-2 mb-8">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
          Technical Stack
        </p>
        <h2
          id="skills-heading"
          className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground"
        >
          Frontend Engineering & Capabilities
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Curated tooling for modern web architecture, strict type safety, responsive performance, and motion systems.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <SkillTabs
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          categoryCounts={categoryCounts}
        />
      </div>

      {/* Active Category Panel with Animated List */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeCategory}`}
        aria-labelledby={`tab-${activeCategory}`}
        className="focus:outline-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            role="list"
            aria-label={`${activeCategory} skills`}
            className="flex flex-col gap-2.5"
          >
            {currentSkills.map((skill) => (
              <motion.div key={skill.name} variants={itemVariants}>
                <SkillRow skill={skill} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Subtle summary indicator */}
        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground/80 px-1 border-t border-border/40 pt-3">
          <span>
            {currentSkills.length} {currentSkills.length === 1 ? 'skill' : 'technologies'} in {activeCategory}
          </span>
          <span className="font-mono text-[11px]">
            {SKILLS_DATA.filter((s) => s.proficiency === 'Core').length} Core Platforms platform-wide
          </span>
        </div>
      </div>
    </section>
  );
}
export default SkillsSection;

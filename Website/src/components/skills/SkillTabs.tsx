'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { SKILL_CATEGORIES, type SkillCategory } from './skills-data';

interface SkillTabsProps {
  activeCategory: SkillCategory;
  onSelectCategory: (category: SkillCategory) => void;
  categoryCounts: Record<SkillCategory, number>;
}

export function SkillTabs({
  activeCategory,
  onSelectCategory,
  categoryCounts,
}: SkillTabsProps) {
  const tabsListRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % SKILL_CATEGORIES.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + SKILL_CATEGORIES.length) % SKILL_CATEGORIES.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = SKILL_CATEGORIES.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextCategory = SKILL_CATEGORIES[nextIndex];
    onSelectCategory(nextCategory);

    // Focus target button
    const buttons = tabsListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div className="relative w-full border-b border-border">
      {/* Scroll container with edge mask */}
      <div
        ref={tabsListRef}
        role="tablist"
        aria-label="Frontend skill categories"
        className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-[-1px] no-scrollbar focus:outline-none"
      >
        {SKILL_CATEGORIES.map((category, index) => {
          const isActive = activeCategory === category;
          const count = categoryCounts[category];

          return (
            <button
              key={category}
              role="tab"
              id={`tab-${category}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${category}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelectCategory(category)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="group relative flex items-center gap-2 px-3 py-2.5 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-t-md cursor-pointer"
            >
              <span
                className={`transition-colors duration-150 ${
                  isActive
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground group-hover:text-foreground/80'
                }`}
              >
                {category}
              </span>

              {/* Badge count */}
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full border transition-colors ${
                  isActive
                    ? 'border-foreground/30 text-foreground bg-foreground/5'
                    : 'border-border/60 text-muted-foreground/70'
                }`}
              >
                {count}
              </span>

              {/* Animated active indicator border */}
              {isActive && (
                <motion.div
                  layoutId="active-skill-tab-indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

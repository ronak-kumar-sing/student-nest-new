'use client';

import * as React from 'react';
import { TechIcon } from './TechIcon';
import type { Skill } from './skills-data';

interface SkillRowProps {
  skill: Skill;
}

export function SkillRow({ skill }: SkillRowProps) {
  const getProficiencyVariant = (level: Skill['proficiency']) => {
    switch (level) {
      case 'Core':
        return 'border-foreground/25 bg-foreground/5 text-foreground font-medium';
      case 'Advanced':
        return 'border-border text-muted-foreground font-normal';
      case 'Working':
      default:
        return 'border-border/60 text-muted-foreground/80 font-normal';
    }
  };

  return (
    <div
      tabIndex={0}
      role="listitem"
      aria-label={`${skill.name} - ${skill.proficiency} proficiency`}
      className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 px-4 py-3.5 rounded-lg border border-border bg-transparent hover:border-foreground/20 hover:bg-muted/40 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Left side: Icon + Name */}
      <div className="flex items-center gap-3.5 min-w-0">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background text-foreground/80 transition-transform duration-150 ease-out group-hover:scale-[1.06] group-hover:text-foreground motion-reduce:group-hover:scale-100"
          aria-hidden="true"
        >
          <TechIcon slug={skill.slug} className="h-4.5 w-4.5" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2.5 min-w-0">
          <span className="text-sm font-medium text-foreground tracking-tight transition-all duration-150 group-hover:font-semibold">
            {skill.name}
          </span>
          {skill.versionOrDetail && (
            <span className="text-[11px] font-mono text-muted-foreground/70 hidden lg:inline-block">
              {skill.versionOrDetail}
            </span>
          )}
        </div>
      </div>

      {/* Right side: Metadata (Desktop hover reveal + Mobile inline) & Tag */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        {/* Context metadata: subtle opacity/slide transition on desktop, visible on mobile */}
        <span className="text-xs text-muted-foreground text-left sm:text-right line-clamp-1 sm:line-clamp-none transition-all duration-200 sm:opacity-75 sm:group-hover:opacity-100">
          {skill.yearsOrContext}
        </span>

        {/* Proficiency pill */}
        <span
          className={`shrink-0 rounded px-2 py-0.5 text-[11px] tracking-wide border ${getProficiencyVariant(
            skill.proficiency,
          )}`}
        >
          {skill.proficiency}
        </span>
      </div>
    </div>
  );
}

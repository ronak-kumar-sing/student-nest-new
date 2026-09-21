import { Metadata } from 'next';
import { SkillsSection } from '@/components/skills/SkillsSection';

export const metadata: Metadata = {
  title: 'Frontend Skills | Technical Stack',
  description: 'Production-quality frontend capabilities, architecture, frameworks, and motion systems.',
};

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground py-16">
      <SkillsSection />
    </main>
  );
}

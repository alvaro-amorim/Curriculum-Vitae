import { InteractiveTerminal } from "@/components/lab/interactive-terminal";
import { SkillRadar } from "@/components/lab/skill-radar";
import { HomeOverview } from "@/components/resume/home-overview";
import { ProjectsPreview } from "@/components/resume/projects-preview";

export default function HomePage() {
  return (
    <>
      <HomeOverview />
      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-10 lg:grid-cols-[1.08fr_0.92fr]">
        <InteractiveTerminal />
        <SkillRadar />
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <ProjectsPreview featuredOnly limit={3} showLinks={false} />
      </section>
    </>
  );
}

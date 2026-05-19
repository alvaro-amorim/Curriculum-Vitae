import { HomeOverview } from "@/components/resume/home-overview";
import { ProjectsPreview } from "@/components/resume/projects-preview";

export default function HomePage() {
  return (
    <>
      <HomeOverview />
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <ProjectsPreview showLinks={false} />
      </section>
    </>
  );
}

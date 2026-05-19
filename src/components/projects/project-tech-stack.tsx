import { Badge } from "@/components/ui/badge";

type ProjectTechStackProps = {
  stack: string[];
};

export function ProjectTechStack({ stack }: ProjectTechStackProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {stack.map((tech) => (
        <Badge key={tech}>{tech}</Badge>
      ))}
    </div>
  );
}

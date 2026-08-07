import { career } from "./career.ts";
import { certificationGroup, education } from "./education.ts";
import { experiences } from "./experience.ts";
import { profile, profileLinks } from "./profile.ts";
import { projectLinks, projects } from "./projects.ts";
import { resumeSummary } from "./resume.ts";
import { skillDomains, skillDomainLabels, skillLevels, skillLevelLabels, skills } from "./skills.ts";

export const portfolioContent = {
  career,
  profile,
  profileLinks,
  education,
  certificationGroup,
  experiences,
  skills,
  skillDomains,
  skillDomainLabels,
  skillLevels,
  skillLevelLabels,
  projects,
  projectLinks,
  resumeSummary,
} as const;

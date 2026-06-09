import { Project } from "@/types";

/**
 * Calculate project progress based on completed milestones
 * Progress = Completed Milestones / Total Milestones
 */
export function calculateProjectProgress(project: Project): number {
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  if (milestones.length === 0) return 0;

  const completedCount = milestones.filter(
    (m) => m.status === "Completed",
  ).length;

  return Math.round((completedCount / milestones.length) * 100);
}

/**
 * Calculate projects statistics for dashboard
 */
export function calculateProjectStats(projects: Project[]) {
  const stats = {
    total: projects.length,
    active: 0,
    completed: 0,
    onHold: 0,
    archived: 0,
  };

  projects.forEach((project) => {
    if (project.status === "Active") stats.active++;
    else if (project.status === "Completed") stats.completed++;
    else if (project.status === "On Hold") stats.onHold++;
    else if (project.status === "Archived") stats.archived++;
  });

  return stats;
}

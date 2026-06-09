import { Project, ProjectHealth } from "@/types";
import { calculateProjectProgress } from "./calculateProgress";

/**
 * Determine project health based on:
 * - Due date proximity
 * - Project progress
 * - Milestone status
 *
 * 🟢 On Track: Due date is far and progress is good
 * 🟡 At Risk: Due date is near and progress is low
 * 🔴 Delayed: Due date passed and not completed
 */
export function getProjectHealth(project: Project): ProjectHealth {
  const now = new Date();
  const dueDate = new Date(project.dueDate);
  const daysUntilDue = Math.floor(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  const progress = calculateProjectProgress(project);

  // Check if project is delayed
  if (daysUntilDue < 0 && project.status !== "Completed") {
    return "Delayed";
  }

  // Check if at risk
  if (daysUntilDue <= 14 && progress < 75) {
    return "At Risk";
  }

  // Check for delayed milestones
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  const hasDelayedMilestones = milestones.some((m) => {
    const milestoneDueDate = new Date(m.dueDate);
    return (
      m.status !== "Completed" &&
      milestoneDueDate < now &&
      m.status !== "Delayed"
    );
  });

  if (hasDelayedMilestones) {
    return "At Risk";
  }

  return "On Track";
}

/**
 * Get health badge color and icon
 */
export function getHealthDisplay(health: ProjectHealth) {
  const display = {
    "On Track": {
      color: "bg-green-100",
      textColor: "text-green-700",
      icon: "🟢",
    },
    "At Risk": {
      color: "bg-yellow-100",
      textColor: "text-yellow-700",
      icon: "🟡",
    },
    Delayed: { color: "bg-red-100", textColor: "text-red-700", icon: "🔴" },
  };
  return display[health];
}

/**
 * Get health based on milestone status
 */
export function getMilestoneHealth(project: Project) {
  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  const completed = milestones.filter(
    (m) => m.status === "Completed",
  ).length;
  const delayed = milestones.filter(
    (m) => m.status === "Delayed",
  ).length;
  const inProgress = milestones.filter(
    (m) => m.status === "In Progress",
  ).length;

  return {
    completed,
    delayed,
    inProgress,
    planned: milestones.filter((m) => m.status === "Planned").length,
  };
}

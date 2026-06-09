import { useMemo } from "react";
import { useProjectStore } from "@/store/useProjectStore";
import { Card, CardContent } from "@/components/ui/card";
import RoadmapTimeline from "@/components/roadmap/RoadmapTimeline";
import { Milestone } from "@/types";

interface MilestoneWithProject extends Milestone {
  projectId: string;
  projectName: string;
}

const RoadmapPage = () => {
  const projects = useProjectStore((state) => state.projects);

  // Collect and sort all milestones from all projects
  const allMilestones = useMemo(() => {
    const milestones: MilestoneWithProject[] = [];

    projects.forEach((project) => {
      project.milestones.forEach((milestone) => {
        milestones.push({
          ...milestone,
          projectId: project.id,
          projectName: project.name,
        });
      });
    });

    // Sort by due date
    return milestones.sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    );
  }, [projects]);

  // Group milestones by month
  const milestonesGroupedByMonth = useMemo(() => {
    const groups: Map<string, MilestoneWithProject[]> = new Map();

    allMilestones.forEach((milestone) => {
      const date = new Date(milestone.dueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(milestone);
    });

    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [allMilestones]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Roadmap</h1>
        <p className="mt-2 text-gray-600">
          All milestones across projects, organized by timeline
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {allMilestones.length}
              </p>
              <p className="text-sm text-gray-600">Total Milestones</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {allMilestones.filter((m) => m.status === "Completed").length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {allMilestones.filter((m) => m.status === "In Progress").length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {allMilestones.filter((m) => m.status === "Delayed").length}
              </p>
              <p className="text-sm text-gray-600">Delayed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {allMilestones.length > 0 ? (
        <RoadmapTimeline milestonesGroupedByMonth={milestonesGroupedByMonth} />
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No milestones found</p>
            <p className="mt-2 text-sm text-gray-400">
              Create projects and add milestones to see them here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoadmapPage;

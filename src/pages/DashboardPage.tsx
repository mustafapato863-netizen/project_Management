import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FolderOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/useProjectStore";
import { getProjectHealth } from "@/utils/projectHealth";
import { formatDate } from "@/utils/dateHelpers";
import DashboardChart from "@/components/dashboard/DashboardChart";
import UpcomingMilestones from "@/components/dashboard/UpcomingMilestones";

const DashboardPage = () => {
  const projects = useProjectStore((state) => state.projects);

  // Calculate statistics
  const stats = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    const onTrack = list.filter((p) => getProjectHealth(p) === "On Track");
    const atRisk = list.filter((p) => getProjectHealth(p) === "At Risk");
    const delayed = list.filter((p) => getProjectHealth(p) === "Delayed");
    const completed = list.filter((p) => p.status === "Completed");
    const active = list.filter(
      (p) => p.status === "Active" || p.status === "On Hold",
    );

    return {
      total: list.length,
      active: active.length,
      completed: completed.length,
      onTrack: onTrack.length,
      atRisk: atRisk.length,
      delayed: delayed.length,
    };
  }, [projects]);

  // Get status distribution
  const statusDistribution = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    return {
      Active: list.filter((p) => p.status === "Active").length,
      Completed: list.filter((p) => p.status === "Completed").length,
      OnHold: list.filter((p) => p.status === "On Hold").length,
      Archived: list.filter((p) => p.status === "Archived").length,
    };
  }, [projects]);

  // Get upcoming milestones
  const upcomingMilestones = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const list = Array.isArray(projects) ? projects : [];

    const milestones = list
      .flatMap((project) => {
        const ms = Array.isArray(project.milestones) ? project.milestones : [];
        return ms.map((m) => ({
          ...m,
          projectId: project.id,
          projectName: project.name,
        }));
      })
      .filter(
        (m) =>
          m.status !== "Completed" &&
          new Date(m.dueDate) >= now &&
          new Date(m.dueDate) <= nextWeek,
      )
      .sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      )
      .slice(0, 5);

    return milestones;
  }, [projects]);

  // Get recent completed milestones
  const recentCompletedMilestones = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    const completed = list
      .flatMap((project) => {
        const ms = Array.isArray(project.milestones) ? project.milestones : [];
        return ms.map((m) => ({
          ...m,
          projectId: project.id,
          projectName: project.name,
        }));
      })
      .filter((m) => m.status === "Completed")
      .sort((a, b) => {
        if (!a.dueDate || !b.dueDate) return 0;
        return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      })
      .slice(0, 5);

    return completed;
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link to="/projects">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <FolderOpen size={18} />
            View All Projects
          </Button>
        </Link>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <FolderOpen className="text-blue-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
              <Clock className="text-orange-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.onTrack}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.atRisk}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={32} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <DashboardChart
          title="Project Status Distribution"
          data={statusDistribution}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Critical", "High", "Medium", "Low"].map((priority) => {
                const list = Array.isArray(projects) ? projects : [];
                const count = list.filter(
                  (p) => p.priority === priority,
                ).length;
                const percentage =
                  list.length > 0
                    ? Math.round((count / list.length) * 100)
                    : 0;
                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{priority}</span>
                      <span className="font-semibold text-gray-900">
                        {count}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          priority === "Critical"
                            ? "bg-red-500"
                            : priority === "High"
                              ? "bg-orange-500"
                              : priority === "Medium"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Milestones and Recent Completed */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <UpcomingMilestones milestones={upcomingMilestones} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            {recentCompletedMilestones.length > 0 ? (
              <div className="space-y-3">
                {recentCompletedMilestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-start gap-3">
                    <CheckCircle className="mt-1 text-green-500" size={18} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {milestone.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {milestone.projectName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(milestone.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No completed milestones yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types";
import { formatDate, getDaysUntilDue } from "@/utils/dateHelpers";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const daysUntil = getDaysUntilDue(project.dueDate);
  const isOverdue = daysUntil < 0;

  const statusColors = {
    Active: "bg-green-100 text-green-700",
    Completed: "bg-gray-100 text-gray-700",
    "On Hold": "bg-yellow-100 text-yellow-700",
    Archived: "bg-gray-200 text-gray-600",
  };

  const priorityColors = {
    Critical: "bg-red-100 text-red-700",
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColors[project.status as keyof typeof statusColors]}`}
            >
              {project.status}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${priorityColors[project.priority as keyof typeof priorityColors]}`}
            >
              {project.priority}
            </span>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-gray-700">{project.description}</p>
          )}

          {/* Key Info */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Started</p>
              <p className="text-sm text-gray-900">
                {formatDate(project.startDate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Due Date</p>
              <p className="text-sm text-gray-900">
                {formatDate(project.dueDate)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">Category</p>
              <p className="text-sm text-gray-900">{project.category}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">
                Time Left
              </p>
              <p
                className={`text-sm font-medium ${
                  isOverdue
                    ? "text-red-600"
                    : daysUntil <= 7
                      ? "text-orange-600"
                      : "text-green-600"
                }`}
              >
                {isOverdue
                  ? `${Math.abs(daysUntil)} days overdue`
                  : daysUntil === 0
                    ? "Due today"
                    : `${daysUntil} days left`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectHeader;

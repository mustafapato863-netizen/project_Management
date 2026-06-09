import { motion } from "framer-motion";
import { MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Project } from "@/types";
import { calculateProjectProgress } from "@/utils/calculateProgress";
import { getProjectHealth, getHealthDisplay } from "@/utils/projectHealth";
import { formatDate } from "@/utils/dateHelpers";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const progress = calculateProjectProgress(project);
  const health = getProjectHealth(project);
  const healthDisplay = getHealthDisplay(health);

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col p-6 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {project.description}
            </p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}
          >
            {project.status}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColors[project.priority as keyof typeof priorityColors]}`}
          >
            {project.priority}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${healthDisplay.color} ${healthDisplay.textColor}`}
          >
            {healthDisplay.icon} {health}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-semibold text-gray-900">
              {progress}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <motion.div
              className="h-full bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Milestones & Dates */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Milestones:</span>
            <span className="text-sm font-semibold text-gray-900">
              {
                project.milestones.filter((m) => m.status === "Completed")
                  .length
              }
              /{project.milestones.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Due:</span>
            <span className="text-sm text-gray-900">
              {formatDate(project.dueDate)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
          {project.category}
        </div>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;

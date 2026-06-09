import { Project, MilestoneStatus, Milestone } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import { formatDate } from "@/utils/dateHelpers";
import { Trash2, Edit2 } from "lucide-react";
import EditMilestoneModal from "@/components/milestones/EditMilestoneModal";
import { useState } from "react";

interface MilestoneTimelineProps {
  project: Project;
}

const statusColors = {
  Planned: "bg-gray-100 text-gray-700 border-gray-300",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-300",
  Completed: "bg-green-100 text-green-700 border-green-300",
  Delayed: "bg-red-100 text-red-700 border-red-300",
};

const statusBgDot = {
  Planned: "bg-gray-400",
  "In Progress": "bg-blue-500",
  Completed: "bg-green-500",
  Delayed: "bg-red-500",
};

const MilestoneTimeline = ({ project }: MilestoneTimelineProps) => {
  const deleteMilestone = useProjectStore((state) => state.deleteMilestone);
  const updateMilestone = useProjectStore((state) => state.updateMilestone);
  const isAdmin = useUIStore((state) => state.isAdmin);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const sortedMilestones = [...project.milestones].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  if (sortedMilestones.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">No milestones yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sortedMilestones.map((milestone, index) => (
        <div key={milestone.id} className="relative">
          {/* Timeline connector */}
          {index < sortedMilestones.length - 1 && (
            <div className="absolute left-5 top-14 w-0.5 h-12 bg-gray-200" />
          )}

          <div className="flex gap-4">
            {/* Timeline dot */}
            <div className="flex flex-col items-center pt-1">
              <div
                className={`w-3 h-3 rounded-full border-2 border-white ${statusBgDot[milestone.status as MilestoneStatus]}`}
              />
            </div>

            {/* Content */}
            <Card className="flex-1">
              <CardContent className="pt-4 pb-4 px-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {milestone.title}
                    </h4>
                    {milestone.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {milestone.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Due {formatDate(milestone.dueDate)}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 font-medium ${statusColors[milestone.status as MilestoneStatus]}`}
                      >
                        {milestone.status}
                      </span>
                    </div>
                  </div>

                   {/* Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <select
                        value={milestone.status}
                        onChange={(e) =>
                          updateMilestone(project.id, milestone.id, {
                            status: e.target.value as MilestoneStatus,
                          })
                        }
                        className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        <option>Planned</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                        <option>Delayed</option>
                      </select>

                      <button
                        onClick={() => setEditingMilestone(milestone)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Edit Milestone"
                      >
                        <Edit2 size={18} />
                      </button>

                      <button
                        onClick={() => deleteMilestone(project.id, milestone.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete Milestone"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
      {editingMilestone && (
        <EditMilestoneModal
          isOpen={!!editingMilestone}
          onClose={() => setEditingMilestone(null)}
          projectId={project.id}
          milestone={editingMilestone}
        />
      )}
    </div>
  );
};

export default MilestoneTimeline;

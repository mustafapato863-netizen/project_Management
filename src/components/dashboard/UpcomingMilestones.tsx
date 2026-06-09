import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateHelpers";
import { Milestone } from "@/types";

interface UpcomingMilestonesProps {
  milestones: (Milestone & { projectId: string; projectName: string })[];
}

const UpcomingMilestones = ({ milestones }: UpcomingMilestonesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upcoming This Week</CardTitle>
      </CardHeader>
      <CardContent>
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.map((milestone) => (
              <Link
                key={milestone.id}
                to={`/projects/${milestone.projectId}`}
                className="flex items-start gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <Clock className="mt-1 text-blue-500 flex-shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {milestone.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {milestone.projectName}
                  </p>
                  <p className="text-xs text-gray-400">
                    Due {formatDate(milestone.dueDate)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium flex-shrink-0 ${
                    milestone.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {milestone.status}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            No upcoming milestones this week
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingMilestones;

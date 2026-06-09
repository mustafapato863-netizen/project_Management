import { Card, CardContent } from "@/components/ui/card";
import { Milestone } from "@/types";
import { formatDate } from "@/utils/dateHelpers";
import { motion } from "framer-motion";

interface RoadmapTimelineProps {
  milestonesGroupedByMonth: [
    string,
    (Milestone & { projectId: string; projectName: string })[],
  ][];
}

const statusColors = {
  Planned: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Delayed: "bg-red-100 text-red-700",
};

const statusBgDot = {
  Planned: "bg-gray-400",
  "In Progress": "bg-blue-500",
  Completed: "bg-green-500",
  Delayed: "bg-red-500",
};

const RoadmapTimeline = ({
  milestonesGroupedByMonth,
}: RoadmapTimelineProps) => {
  return (
    <div className="space-y-8">
      {milestonesGroupedByMonth.map(([monthKey, milestones]) => {
        const [year, month] = monthKey.split("-");
        const monthDate = new Date(`${year}-${month}-01`);
        const monthName = monthDate.toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });

        return (
          <div key={monthKey}>
            {/* Month Header */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{monthName}</h3>
              <div className="mt-1 h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full" />
            </div>

            {/* Milestones for this month */}
            <div className="space-y-3 pl-4 border-l-2 border-gray-200">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-2">
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-white ${statusBgDot[milestone.status]}`}
                    />
                  </div>

                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4 px-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {milestone.projectName}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium flex-shrink-0 ${statusColors[milestone.status]}`}
                          >
                            {milestone.status}
                          </span>
                        </div>

                        {milestone.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {milestone.description}
                          </p>
                        )}

                        <div className="text-xs text-gray-500 flex items-center gap-4">
                          <span>📅 {formatDate(milestone.dueDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapTimeline;

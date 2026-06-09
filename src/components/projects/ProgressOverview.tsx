import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";
import { calculateProjectProgress } from "@/utils/calculateProgress";
import { getMilestoneHealth } from "@/utils/projectHealth";
import { motion } from "framer-motion";

interface ProgressOverviewProps {
  project: Project;
}

const ProgressOverview = ({ project }: ProgressOverviewProps) => {
  const progress = calculateProjectProgress(project);
  const milestoneHealth = getMilestoneHealth(project);
  const total = project.milestones.length;

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall</span>
              <span className="text-2xl font-bold text-gray-900">
                {progress}%
              </span>
            </div>
            <div className="h-4 rounded-full bg-gray-200 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Statistics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {milestoneHealth.completed}
              </p>
              <p className="text-sm text-gray-600 mt-2">Completed</p>
              <p className="text-xs text-gray-500 mt-1">of {total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {milestoneHealth.inProgress}
              </p>
              <p className="text-sm text-gray-600 mt-2">In Progress</p>
              <p className="text-xs text-gray-500 mt-1">of {total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">
                {milestoneHealth.planned}
              </p>
              <p className="text-sm text-gray-600 mt-2">Planned</p>
              <p className="text-xs text-gray-500 mt-1">of {total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">
                {milestoneHealth.delayed}
              </p>
              <p className="text-sm text-gray-600 mt-2">Delayed</p>
              <p className="text-xs text-gray-500 mt-1">of {total}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressOverview;

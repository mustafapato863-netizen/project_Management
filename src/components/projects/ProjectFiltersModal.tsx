import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useUIStore } from "@/store/useUIStore";
import { ProjectStatus, ProjectCategory, ProjectPriority } from "@/types";

const statuses: ProjectStatus[] = [
  "Active",
  "Completed",
  "On Hold",
  "Archived",
];
const categories: ProjectCategory[] = [
  "Development",
  "Design",
  "Marketing",
  "Infrastructure",
  "Research",
  "Other",
];
const priorities: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];

const ProjectFiltersModal = () => {
  const filters = useUIStore((state) => state.filters);
  const setFilters = useUIStore((state) => state.setFilters);
  const resetFilters = useUIStore((state) => state.resetFilters);

  const [localStatus, setLocalStatus] = useState<ProjectStatus[]>(
    filters.status || [],
  );
  const [localCategory, setLocalCategory] = useState<ProjectCategory[]>(
    filters.category || [],
  );
  const [localPriority, setLocalPriority] = useState<ProjectPriority[]>(
    filters.priority || [],
  );

  const handleStatusChange = (status: ProjectStatus) => {
    setLocalStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const handleCategoryChange = (category: ProjectCategory) => {
    setLocalCategory((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handlePriorityChange = (priority: ProjectPriority) => {
    setLocalPriority((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  const handleApply = () => {
    setFilters({
      status: localStatus.length > 0 ? localStatus : undefined,
      category: localCategory.length > 0 ? localCategory : undefined,
      priority: localPriority.length > 0 ? localPriority : undefined,
    });
  };

  return (
    <Card className="border border-gray-300 bg-white">
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Status</h4>
          <div className="space-y-2">
            {statuses.map((status) => (
              <label
                key={status}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={localStatus.includes(status)}
                  onChange={() => handleStatusChange(status)}
                />
                <span className="text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Category</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={localCategory.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <span className="text-sm text-gray-700">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Priority</h4>
          <div className="space-y-2">
            {priorities.map((priority) => (
              <label
                key={priority}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Checkbox
                  checked={localPriority.includes(priority)}
                  onChange={() => handlePriorityChange(priority)}
                />
                <span className="text-sm text-gray-700">{priority}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </Button>
          <Button
            onClick={() => {
              setLocalStatus([]);
              setLocalCategory([]);
              setLocalPriority([]);
              resetFilters();
            }}
            variant="outline"
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectFiltersModal;

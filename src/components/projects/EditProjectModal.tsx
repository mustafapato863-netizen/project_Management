import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore } from "@/store/useProjectStore";
import { Project, ProjectCategory, ProjectPriority, ProjectStatus } from "@/types";

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

const EditProjectModal = ({ isOpen, onClose, project }: EditProjectModalProps) => {
  const updateProject = useProjectStore((state) => state.updateProject);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [category, setCategory] = useState<ProjectCategory>(project.category);
  const [priority, setPriority] = useState<ProjectPriority>(project.priority);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState(
    project.startDate ? project.startDate.split("T")[0] : ""
  );
  const [dueDate, setDueDate] = useState(
    project.dueDate ? project.dueDate.split("T")[0] : ""
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    dueDate?: string;
    startDate?: string;
    submit?: string;
  }>({});
  const [touched, setTouched] = useState<{
    name?: boolean;
    dueDate?: boolean;
    startDate?: boolean;
  }>({});

  // Update form state if project prop changes
  useEffect(() => {
    setName(project.name);
    setDescription(project.description);
    setCategory(project.category);
    setPriority(project.priority);
    setStatus(project.status);
    setStartDate(project.startDate ? project.startDate.split("T")[0] : "");
    setDueDate(project.dueDate ? project.dueDate.split("T")[0] : "");
    setErrors({});
    setTouched({});
  }, [project]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Project name is required";
    }
    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }
    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      newErrors.startDate = "Start date cannot be after due date";
    }
    return newErrors;
  };

  const handleSave = async () => {
    setTouched({ name: true, dueDate: true, startDate: true });
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      await updateProject(project.id, {
        name,
        description,
        category,
        priority,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : project.startDate,
        dueDate: new Date(dueDate).toISOString(),
      });
      onClose();
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to update project. Check that the backend server is running and accessible.",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto text-left">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Edit Project Details</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              placeholder="Enter project name"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none transition-all ${
                touched.name && errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category, Priority & Status */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option>Development</option>
                <option>Design</option>
                <option>Marketing</option>
                <option>Infrastructure</option>
                <option>Research</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option>Active</option>
                <option>On Hold</option>
                <option>Completed</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setErrors((prev) => ({ ...prev, startDate: undefined }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, startDate: true }))}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none transition-all ${
                  touched.startDate && errors.startDate
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {touched.startDate && errors.startDate && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setErrors((prev) => ({ ...prev, dueDate: undefined, startDate: undefined }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, dueDate: true }))}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none transition-all ${
                  touched.dueDate && errors.dueDate
                    ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10"
                    : "border-gray-300 focus:border-blue-500"
                }`}
              />
              {touched.dueDate && errors.dueDate && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {errors.submit && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProjectModal;

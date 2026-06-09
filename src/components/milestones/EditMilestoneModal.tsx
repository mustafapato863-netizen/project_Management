import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore } from "@/store/useProjectStore";
import { Milestone, MilestoneStatus } from "@/types";

interface EditMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  milestone: Milestone;
}

const EditMilestoneModal = ({
  isOpen,
  onClose,
  projectId,
  milestone,
}: EditMilestoneModalProps) => {
  const updateMilestone = useProjectStore((state) => state.updateMilestone);
  const project = useProjectStore((state) => state.getProjectById(projectId));

  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description);
  const [dueDate, setDueDate] = useState(
    milestone.dueDate ? milestone.dueDate.split("T")[0] : ""
  );
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    dueDate?: string;
    submit?: string;
  }>({});
  const [touched, setTouched] = useState<{
    title?: boolean;
    dueDate?: boolean;
  }>({});

  // Reset/update form when props change
  useEffect(() => {
    setTitle(milestone.title);
    setDescription(milestone.description);
    setDueDate(milestone.dueDate ? milestone.dueDate.split("T")[0] : "");
    setStatus(milestone.status);
    setErrors({});
    setTouched({});
  }, [milestone]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = "Milestone title is required";
    }
    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (project && new Date(dueDate) > new Date(project.dueDate)) {
      const formattedProjectDate = new Date(project.dueDate).toLocaleDateString();
      newErrors.dueDate = `Milestone due date cannot exceed the project's due date (${formattedProjectDate})`;
    }
    return newErrors;
  };

  const handleSave = async () => {
    setTouched({ title: true, dueDate: true });
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      await updateMilestone(projectId, milestone.id, {
        title,
        description,
        status,
        dueDate: new Date(dueDate).toISOString(),
      });
      onClose();
    } catch {
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to update milestone. Check that the backend server is running.",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4 text-left">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Edit Milestone</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) {
                  setErrors((prev) => ({ ...prev, title: undefined }));
                }
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
              placeholder="Milestone title"
              className={`w-full rounded-lg border px-3 py-2 focus:outline-none transition-all ${
                touched.title && errors.title
                  ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10"
                  : "border-gray-300 focus:border-blue-500"
              }`}
            />
            {touched.title && errors.title && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.title}</p>
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
              placeholder="Milestone description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                setErrors((prev) => ({ ...prev, dueDate: undefined }));
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

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            >
              <option>Planned</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Delayed</option>
            </select>
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

export default EditMilestoneModal;

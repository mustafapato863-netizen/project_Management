import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore } from "@/store/useProjectStore";
import { ProjectCategory, ProjectPriority } from "@/types";
import { generateId } from "@/utils/generateId";
import { projectTemplates } from "@/data/projectTemplates";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateProjectModal = ({ isOpen, onClose }: CreateProjectModalProps) => {
  const addProject = useProjectStore((state) => state.addProject);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("Development");
  const [priority, setPriority] = useState<ProjectPriority>("Medium");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [useTemplate, setUseTemplate] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !dueDate) {
      alert("Please fill in project name and due date");
      return;
    }

    setIsSaving(true);

    const templateConfig = useTemplate
      ? projectTemplates[useTemplate as keyof typeof projectTemplates]
      : null;

    const now = new Date();
    const dueDateISO = new Date(dueDate).toISOString();
    const startDateISO = startDate
      ? new Date(startDate).toISOString()
      : now.toISOString();

    try {
      await addProject({
        name,
        description,
        category: templateConfig?.category || category,
        status: "Active",
        priority,
        startDate: startDateISO,
        dueDate: dueDateISO,
        notes: "",
        links: [],
        milestones: templateConfig
          ? templateConfig.milestones.map((m) => ({
              ...m,
              id: generateId(),
              dueDate: dueDateISO,
            }))
          : [],
      });

      setName("");
      setDescription("");
      setCategory("Development");
      setPriority("Medium");
      setStartDate("");
      setDueDate("");
      setUseTemplate(null);
      onClose();
    } catch {
      alert("Failed to create project. Check that the backend is running.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Create New Project</CardTitle>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Start from template (optional)
            </label>
            <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
              {Object.entries(projectTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() =>
                    setUseTemplate(useTemplate === key ? null : key)
                  }
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    useTemplate === key
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <p className="font-medium text-gray-900">{template.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {template.milestones.length} milestones
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
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

          {/* Category & Priority */}
          <div className="grid gap-4 grid-cols-2">
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
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProjectModal;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project, ProjectLink } from "@/types";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import { Plus, ExternalLink, Trash2 } from "lucide-react";
import { generateId } from "@/utils/generateId";

interface LinksSectionProps {
  project: Project;
}

const LINK_TYPES = [
  "GitHub",
  "Figma",
  "Docs",
  "Documentation",
  "Slack",
  "Jira",
  "Linear",
  "Drive",
  "Other",
];

const LinkIcon: Record<string, string> = {
  GitHub: "🐙",
  Figma: "🎨",
  Docs: "📄",
  Documentation: "📚",
  Slack: "💬",
  Jira: "📋",
  Linear: "↦",
  Drive: "📁",
  Other: "🔗",
};

const LinksSection = ({ project }: LinksSectionProps) => {
  const updateProject = useProjectStore((state) => state.updateProject);
  const isAdmin = useUIStore((state) => state.isAdmin);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const handleAddLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) {
      alert("Please fill in both label and URL");
      return;
    }

    const newLink: ProjectLink = {
      id: generateId(),
      label: newLabel,
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
    };

    updateProject(project.id, {
      links: [...project.links, newLink],
    });

    setNewLabel("");
    setNewUrl("");
    setIsAdding(false);
  };

  const handleDeleteLink = (linkId: string) => {
    updateProject(project.id, {
      links: project.links.filter((l) => l.id !== linkId),
    });
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">Links & Resources</CardTitle>
        {!isAdding && isAdmin && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Plus size={20} />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isAdding && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
            <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
              <select
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select type</option>
                {LINK_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com"
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddLink}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add Link
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {project.links.length > 0 ? (
          <div className="space-y-2">
            {project.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
              >
                <span className="text-xl">
                  {LinkIcon[link.label] || LinkIcon.Other}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{link.label}</p>
                  <p className="text-xs text-gray-500 truncate">{link.url}</p>
                </div>
                <ExternalLink
                  size={18}
                  className="text-gray-400 group-hover:text-blue-600"
                />
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteLink(link.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {isAdding ? "" : "No links yet"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LinksSection;

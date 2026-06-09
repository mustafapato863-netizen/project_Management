import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import { useProjectStore } from "@/store/useProjectStore";
import { Edit2, Trash2 } from "lucide-react";

interface NotesSectionProps {
  project: Project;
}

const NotesSection = ({ project }: NotesSectionProps) => {
  const updateProject = useProjectStore((state) => state.updateProject);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(project.notes || "");

  const handleSave = () => {
    updateProject(project.id, { notes: noteContent });
    setIsEditing(false);
  };

  const handleClear = () => {
    updateProject(project.id, { notes: "" });
    setNoteContent("");
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-lg">Project Notes</CardTitle>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 size={18} />
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Add notes here..."
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setNoteContent(project.notes || "");
                  setIsEditing(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
              {noteContent && (
                <Button
                  onClick={handleClear}
                  variant="outline"
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </>
        ) : (
          <div
            className={`whitespace-pre-wrap rounded-lg border border-gray-200 p-4 ${
              project.notes ? "text-gray-700" : "text-gray-400 italic"
            }`}
          >
            {project.notes ||
              "No notes yet. Click the edit button to add notes."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesSection;

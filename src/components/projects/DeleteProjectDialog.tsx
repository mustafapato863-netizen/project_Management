import { useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "@/types";

interface DeleteProjectDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const DeleteProjectDialog = ({
  project,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
}: DeleteProjectDialogProps) => {
  const [confirmName, setConfirmName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const milestoneCount = project.milestones.length;
  const linkCount = project.links.length;
  const hasNotes = Boolean(project.notes?.trim());
  const nameMatches =
    confirmName.trim().toLowerCase() === project.name.trim().toLowerCase();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      window.clearTimeout(timer);
    };
  }, [isDeleting, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <Card
        className="w-full max-w-md shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-labelledby="delete-project-title"
        aria-describedby="delete-project-description"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle id="delete-project-title" className="text-lg">
                Delete Project
              </CardTitle>
              <p
                id="delete-project-description"
                className="mt-1 text-sm text-gray-600"
              >
                This action is permanent and cannot be undone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <p className="text-sm text-red-900">
              You are about to delete{" "}
              <span className="font-semibold">"{project.name}"</span> and all of
              its data:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-red-800">
              <li>
                {milestoneCount} milestone{milestoneCount !== 1 ? "s" : ""}
              </li>
              <li>
                {linkCount} link{linkCount !== 1 ? "s" : ""}
              </li>
              {hasNotes && <li>Project notes</li>}
            </ul>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm-project-name"
              className="text-sm font-medium text-gray-700"
            >
              Type <span className="font-semibold">{project.name}</span> to
              confirm
            </label>
            <input
              ref={inputRef}
              id="confirm-project-name"
              type="text"
              value={confirmName}
              onChange={(event) => setConfirmName(event.target.value)}
              placeholder={project.name}
              disabled={isDeleting}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:bg-gray-50"
              autoComplete="off"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
              disabled={!nameMatches || isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteProjectDialog;

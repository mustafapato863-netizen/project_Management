import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectDangerZoneProps {
  onDelete: () => void;
}

const ProjectDangerZone = ({ onDelete }: ProjectDangerZoneProps) => {
  return (
    <Card className="border-red-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-red-700">Danger Zone</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">Delete this project</p>
          <p className="mt-1 text-sm text-gray-600">
            Permanently remove this project, including milestones, notes, and
            links.
          </p>
        </div>
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          className="shrink-0 gap-2"
        >
          <Trash2 size={16} />
          Delete Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectDangerZone;

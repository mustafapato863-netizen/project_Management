import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import ProjectHeader from "@/components/projects/ProjectHeader";
import ProgressOverview from "@/components/projects/ProgressOverview";
import MilestoneTimeline from "@/components/projects/MilestoneTimeline";
import NotesSection from "@/components/projects/NotesSection";
import LinksSection from "@/components/projects/LinksSection";
import AddMilestoneModal from "@/components/milestones/AddMilestoneModal";
import EditProjectModal from "@/components/projects/EditProjectModal";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import ProjectDangerZone from "@/components/projects/ProjectDangerZone";

const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = useProjectStore((state) => state.getProjectById(id || ""));
  const deleteProject = useProjectStore((state) => state.deleteProject);
  const isAdmin = useUIStore((state) => state.isAdmin);

  const [activeTab, setActiveTab] = useState<
    "overview" | "milestones" | "roadmap" | "notes" | "links"
  >("overview");
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} />
          Back to Projects
        </button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-gray-600">Project not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await deleteProject(project.id);
      navigate("/projects");
    } catch {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/projects")}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        {isAdmin && (
          <button
            onClick={() => setShowEditProject(true)}
            className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center border border-slate-100 shadow-sm"
            title="Edit Project Details"
          >
            <Edit2 size={16} />
          </button>
        )}
      </div>

      {/* Project Header Info */}
      <ProjectHeader project={project} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {["overview", "milestones", "roadmap", "notes", "links"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && <ProgressOverview project={project} />}

        {activeTab === "milestones" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Milestones
              </h2>
              {isAdmin && (
                <Button
                  onClick={() => setShowAddMilestone(true)}
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add Milestone
                </Button>
              )}
            </div>
            <MilestoneTimeline project={project} />
          </div>
        )}

        {activeTab === "roadmap" && (
          <Card>
            <CardHeader>
              <CardTitle>Project Roadmap</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Visual roadmap coming soon</p>
            </CardContent>
          </Card>
        )}

        {activeTab === "notes" && <NotesSection project={project} />}

        {activeTab === "links" && <LinksSection project={project} />}
      </div>

      {isAdmin && <ProjectDangerZone onDelete={() => setShowDeleteDialog(true)} />}

      <AddMilestoneModal
        isOpen={showAddMilestone}
        onClose={() => setShowAddMilestone(false)}
        projectId={project.id}
      />

      <EditProjectModal
        isOpen={showEditProject}
        onClose={() => setShowEditProject(false)}
        project={project}
      />

      {showDeleteDialog && (
        <DeleteProjectDialog
          project={project}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;

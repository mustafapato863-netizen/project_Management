import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProjectStore } from "@/store/useProjectStore";
import { useUIStore } from "@/store/useUIStore";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectFiltersModal from "@/components/projects/ProjectFiltersModal";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

const ProjectsPage = () => {
  const projects = useProjectStore((state) => state.projects);
  const isLoading = useProjectStore((state) => state.isLoading);
  const error = useProjectStore((state) => state.error);
  const searchProjects = useProjectStore((state) => state.searchProjects);
  const filters = useUIStore((state) => state.filters);
  const sort = useUIStore((state) => state.sort);
  const isAdmin = useUIStore((state) => state.isAdmin);

  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || "");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    let result = [...list];

    // Apply search
    if (searchQuery.trim()) {
      const searchResult = searchProjects(searchQuery);
      result = Array.isArray(searchResult) ? [...searchResult] : [];
    } else {
      // Apply status filter
      if (filters.status && filters.status.length > 0) {
        result = result.filter((p) => filters.status!.includes(p.status));
      }

      // Apply category filter
      if (filters.category && filters.category.length > 0) {
        result = result.filter((p) => filters.category!.includes(p.category));
      }

      // Apply priority filter
      if (filters.priority && filters.priority.length > 0) {
        result = result.filter((p) => filters.priority!.includes(p.priority));
      }
    }

    // Apply sort
    result.sort((a, b) => {
      let compareValue = 0;

      if (sort.field === "name") {
        compareValue = a.name.localeCompare(b.name);
      } else if (sort.field === "dueDate") {
        compareValue =
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sort.field === "createdAt") {
        compareValue =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sort.direction === "asc" ? compareValue : -compareValue;
    });

    return result;
  }, [projects, searchQuery, filters, sort, searchProjects]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {isAdmin && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} />
            New Project
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg border border-gray-300 p-2 hover:bg-gray-50"
        >
          <Filter size={18} className="text-gray-600" />
        </button>

        <div className="flex gap-1 rounded-lg border border-gray-300 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded px-3 py-1 text-sm ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded px-3 py-1 text-sm ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && <ProjectFiltersModal />}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredProjects.length} of {projects.length} projects
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Loading projects from server...</p>
          </CardContent>
        </Card>
      ) : filteredProjects.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredProjects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`}>
              <ProjectCard project={project} />
            </Link>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No projects found</p>
            <p className="mt-2 text-sm text-gray-400">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default ProjectsPage;

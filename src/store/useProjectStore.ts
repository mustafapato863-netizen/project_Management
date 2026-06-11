import { create } from "zustand";
import {
  Project,
  Milestone,
  ProjectStatus,
  ProjectCategory,
  ProjectPriority,
} from "@/types";
import { generateId } from "@/utils/generateId";
import { projectApi } from "@/services/projectApi";
import { toast } from "react-hot-toast";

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: string | null;
  serverUpdatedAt: string | null;

  loadProjects: () => Promise<void>;
  syncProjects: () => Promise<void>;

  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  getProjectById: (id: string) => Project | undefined;

  addMilestone: (
    projectId: string,
    milestone: Omit<Milestone, "id">,
  ) => Promise<void>;
  updateMilestone: (
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>,
  ) => Promise<void>;
  deleteMilestone: (projectId: string, milestoneId: string) => Promise<void>;
  reorderMilestones: (
    projectId: string,
    milestoneIds: string[],
  ) => Promise<void>;

  getProjectsByStatus: (status: ProjectStatus) => Project[];
  getProjectsByCategory: (category: ProjectCategory) => Project[];
  getProjectsByPriority: (priority: ProjectPriority) => Project[];
  searchProjects: (query: string) => Project[];
  getAllDueSoonProjects: (days: number) => Project[];
}

const setSyncError = (message: string) => {
  useProjectStore.setState({ error: message, isSyncing: false });
};

export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  isLoading: false,
  isSyncing: false,
  error: null,
  lastSyncedAt: null,
  serverUpdatedAt: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });

    try {
      const [projects, meta] = await Promise.all([
        projectApi.getAll(),
        projectApi.getMeta(),
      ]);

      set({
        projects,
        isLoading: false,
        lastSyncedAt: new Date().toISOString(),
        serverUpdatedAt: meta.updatedAt,
      });
    } catch (error) {
      console.error("Failed to load projects:", error);
      set({
        isLoading: false,
        error: "Unable to connect to the server. Make sure the backend is running.",
      });
    }
  },

  syncProjects: async () => {
    const { isSyncing, serverUpdatedAt } = get();
    if (isSyncing) return;

    set({ isSyncing: true, error: null });

    try {
      const meta = await projectApi.getMeta();

      if (serverUpdatedAt && meta.updatedAt === serverUpdatedAt) {
        set({ isSyncing: false, lastSyncedAt: new Date().toISOString() });
        return;
      }

      const projects = await projectApi.getAll();
      set({
        projects,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        serverUpdatedAt: meta.updatedAt,
      });
    } catch (error) {
      console.error("Failed to sync projects:", error);
      setSyncError("Sync failed. Changes from your team may not be visible yet.");
    }
  },

  addProject: async (projectData) => {
    try {
      const created = await projectApi.create(projectData);
      const meta = await projectApi.getMeta();
      set((state) => ({
        projects: [...(Array.isArray(state.projects) ? state.projects : []), created],
        serverUpdatedAt: meta.updatedAt,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      }));
    } catch (error) {
      console.error("Failed to create project:", error);
      setSyncError("Failed to create project.");
      throw error;
    }
  },

  updateProject: async (id, updates) => {
    try {
      const updated = await projectApi.update(id, updates);
      const meta = await projectApi.getMeta();
      set((state) => ({
        projects: (Array.isArray(state.projects) ? state.projects : []).map((project) =>
          project.id === id ? updated : project,
        ),
        serverUpdatedAt: meta.updatedAt,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      }));
    } catch (error) {
      console.error("Failed to update project:", error);
      setSyncError("Failed to save project changes.");
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await projectApi.delete(id);
      const meta = await projectApi.getMeta();
      set((state) => ({
        projects: (Array.isArray(state.projects) ? state.projects : []).filter((project) => project.id !== id),
        serverUpdatedAt: meta.updatedAt,
        lastSyncedAt: new Date().toISOString(),
        error: null,
      }));
    } catch (error) {
      console.error("Failed to delete project:", error);
      setSyncError("Failed to delete project.");
      throw error;
    }
  },

  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id);
  },

  addMilestone: async (projectId, milestoneData) => {
    const currentProjects = Array.isArray(get().projects) ? get().projects : [];
    const project = currentProjects.find((p) => p.id === projectId);
    if (!project) {
      toast.error("Project not found!");
      return;
    }

    const currentMilestones = Array.isArray(project.milestones) ? project.milestones : [];
    const tempId = `temp-${generateId()}`;
    const newMilestone: Milestone = {
      ...milestoneData,
      id: tempId,
      order: milestoneData.order ?? currentMilestones.length,
    };

    // Keep reference to previous milestone IDs to identify server-assigned ID
    const previousMilestoneIds = new Set(currentMilestones.map((m) => m.id));

    // Optimistic Mutation: immediately insert the milestone into the state
    const optimisticMilestones = [...currentMilestones, newMilestone];

    set({
      projects: currentProjects.map((p) =>
        p.id === projectId ? { ...p, milestones: optimisticMilestones } : p
      ),
    });

    // Run the API update in the background (asynchronous background sync)
    (async () => {
      try {
        const updatedProject = await projectApi.update(projectId, {
          milestones: optimisticMilestones,
        });
        const meta = await projectApi.getMeta();

        if (updatedProject && Array.isArray(updatedProject.milestones)) {
          // Identify the newly created milestone from the server's returned list
          // It is the milestone in the server list whose ID was NOT in the previous list of IDs.
          const serverNewMilestone = updatedProject.milestones.find(
            (m) => m && m.id && !previousMilestoneIds.has(m.id)
          );

          // If the server returned a database-generated ID, use it. Otherwise fallback to tempId.
          const permanentId = serverNewMilestone ? serverNewMilestone.id : tempId;

          // Seamless ID Swapping in local state
          set((state) => {
            const stateProjects = Array.isArray(state.projects) ? state.projects : [];
            return {
              projects: stateProjects.map((p) => {
                if (p.id !== projectId) return p;
                const pMilestones = Array.isArray(p.milestones) ? p.milestones : [];
                return {
                  ...p,
                  milestones: pMilestones.map((m) =>
                    m.id === tempId ? { ...m, id: permanentId } : m
                  ),
                };
              }),
              serverUpdatedAt: meta.updatedAt,
              lastSyncedAt: new Date().toISOString(),
              error: null,
            };
          });
        }
      } catch (error) {
        console.error("Failed to sync optimistic milestone:", error);

        // Perform full state rollback by removing the optimistic milestone
        set((state) => {
          const stateProjects = Array.isArray(state.projects) ? state.projects : [];
          return {
            projects: stateProjects.map((p) => {
              if (p.id !== projectId) return p;
              const pMilestones = Array.isArray(p.milestones) ? p.milestones : [];
              return {
                ...p,
                milestones: pMilestones.filter((m) => m.id !== tempId),
              };
            }),
          };
        });

        // Set store error state
        setSyncError("Failed to save milestone changes to server.");

        // Alert user with a non-blocking toast
        toast.error(`Failed to add milestone "${newMilestone.title}". Your changes were rolled back.`);
      }
    })();
  },

  updateMilestone: async (projectId, milestoneId, updates) => {
    const project = get().getProjectById(projectId);
    if (!project) return;

    const milestones = Array.isArray(project.milestones) ? project.milestones : [];
    const updatedMilestones = milestones.map((milestone) =>
      milestone && milestone.id === milestoneId ? { ...milestone, ...updates } : milestone,
    );

    await get().updateProject(projectId, { milestones: updatedMilestones });
  },

  deleteMilestone: async (projectId, milestoneId) => {
    const project = get().getProjectById(projectId);
    if (!project) return;

    const milestones = Array.isArray(project.milestones) ? project.milestones : [];
    const updatedMilestones = milestones.filter(
      (milestone) => milestone && milestone.id !== milestoneId,
    );

    await get().updateProject(projectId, { milestones: updatedMilestones });
  },

  reorderMilestones: async (projectId, milestoneIds) => {
    const project = get().getProjectById(projectId);
    if (!project) return;

    const milestones = Array.isArray(project.milestones) ? project.milestones : [];
    const ids = Array.isArray(milestoneIds) ? milestoneIds : [];
    const orderMap = new Map(ids.map((id, index) => [id, index]));
    const reorderedMilestones = [...milestones]
      .sort(
        (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
      )
      .map((milestone, index) => ({ ...milestone, order: index }));

    await get().updateProject(projectId, { milestones: reorderedMilestones });
  },

  getProjectsByStatus: (status) => {
    const list = get().projects;
    return (Array.isArray(list) ? list : []).filter((project) => project.status === status);
  },

  getProjectsByCategory: (category) => {
    const list = get().projects;
    return (Array.isArray(list) ? list : []).filter((project) => project.category === category);
  },

  getProjectsByPriority: (priority) => {
    const list = get().projects;
    return (Array.isArray(list) ? list : []).filter((project) => project.priority === priority);
  },

  searchProjects: (query) => {
    const lowerQuery = query.toLowerCase();
    const list = get().projects;
    return (Array.isArray(list) ? list : []).filter(
      (project) =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description.toLowerCase().includes(lowerQuery),
    );
  },

  getAllDueSoonProjects: (days) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const list = get().projects;

    return (Array.isArray(list) ? list : []).filter((project) => {
      const dueDate = new Date(project.dueDate);
      return dueDate > now && dueDate <= futureDate;
    });
  },
}));

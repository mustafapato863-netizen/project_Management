import axios from "axios";
import { Project, Milestone, MilestoneStatus } from "@/types";

const getAPIURL = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    let url = import.meta.env.VITE_API_URL;
    if (url.startsWith("http") && !url.endsWith("/api") && !url.endsWith("/api/")) {
      url = url.replace(/\/$/, "") + "/api";
    }
    return url;
  }
  return "/api";
};

const projectApiClient = axios.create({
  baseURL: getAPIURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ProjectsMeta {
  updatedAt: string;
  count: number;
}

const sanitizeMilestone = (m: any): Milestone => {
  return {
    id: m?.id ? String(m.id) : "",
    title: m?.title ? String(m.title) : "",
    description: m?.description ? String(m.description) : "",
    status: (m?.status || "Planned") as MilestoneStatus,
    dueDate: m?.dueDate || new Date().toISOString(),
    notes: m?.notes ? String(m.notes) : "",
    order: typeof m?.order === "number" ? m.order : 0,
  };
};

const sanitizeProject = (p: any): Project => {
  return {
    id: p?.id ? String(p.id) : (p?._id ? String(p._id) : ""),
    name: p?.name ? String(p.name) : "",
    description: p?.description ? String(p.description) : "",
    category: p?.category || "Development",
    status: p?.status || "Active",
    priority: p?.priority || "Medium",
    startDate: p?.startDate || new Date().toISOString(),
    dueDate: p?.dueDate || new Date().toISOString(),
    notes: p?.notes ? String(p.notes) : "",
    links: Array.isArray(p?.links) ? p.links : [],
    milestones: Array.isArray(p?.milestones) ? p.milestones.map(sanitizeMilestone) : [],
    createdAt: p?.createdAt || new Date().toISOString(),
    updatedAt: p?.updatedAt || new Date().toISOString(),
  };
};

export const projectApi = {
  getMeta: async (): Promise<ProjectsMeta> => {
    const response = await projectApiClient.get<any>("/projects/meta");
    const data = response.data;
    return {
      updatedAt: data?.updatedAt || new Date().toISOString(),
      count: typeof data?.count === "number" ? data.count : 0,
    };
  },

  getAll: async (): Promise<Project[]> => {
    const response = await projectApiClient.get<any>("/projects");
    const data = response.data;
    const rawProjects = Array.isArray(data)
      ? data
      : (data && typeof data === "object" && Array.isArray(data.data))
        ? data.data
        : (data && typeof data === "object" && Array.isArray(data.projects))
          ? data.projects
          : [];
    return rawProjects.map(sanitizeProject);
  },

  getById: async (id: string): Promise<Project> => {
    const response = await projectApiClient.get<any>(`/projects/${id}`);
    const data = response.data;
    const project = data && typeof data === "object" && "data" in data ? data.data : data;
    return sanitizeProject(project);
  },

  create: async (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ): Promise<Project> => {
    const response = await projectApiClient.post<any>("/projects", project);
    const data = response.data;
    const created = data && typeof data === "object" && "data" in data ? data.data : data;
    return sanitizeProject(created);
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const response = await projectApiClient.put<any>(
      `/projects/${id}`,
      updates,
    );
    const data = response.data;
    const updated = data && typeof data === "object" && "data" in data ? data.data : data;
    return sanitizeProject(updated);
  },

  delete: async (id: string): Promise<void> => {
    await projectApiClient.delete(`/projects/${id}`);
  },
};


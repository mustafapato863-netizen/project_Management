import axios from "axios";
import { Project } from "@/types";

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

export const projectApi = {
  getMeta: async (): Promise<ProjectsMeta> => {
    const response = await projectApiClient.get<ProjectsMeta>("/projects/meta");
    return response.data;
  },

  getAll: async (): Promise<Project[]> => {
    const response = await projectApiClient.get<Project[]>("/projects");
    return response.data;
  },

  getById: async (id: string): Promise<Project> => {
    const response = await projectApiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ): Promise<Project> => {
    const response = await projectApiClient.post<Project>("/projects", project);
    return response.data;
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project> => {
    const response = await projectApiClient.put<Project>(
      `/projects/${id}`,
      updates,
    );
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await projectApiClient.delete(`/projects/${id}`);
  },
};

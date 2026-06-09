// ============================================
// PROJECT PORTFOLIO MANAGER TYPES
// ============================================

// Milestone Types
export type MilestoneStatus =
  | "Planned"
  | "In Progress"
  | "Completed"
  | "Delayed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate: string; // ISO string
  notes?: string;
  order?: number;
}

// Project Types
export type ProjectStatus = "Active" | "On Hold" | "Completed" | "Archived";
export type ProjectCategory =
  | "Development"
  | "Design"
  | "Marketing"
  | "Infrastructure"
  | "Research"
  | "Other";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";
export type ProjectHealth = "On Track" | "At Risk" | "Delayed";

export interface ProjectLink {
  id: string;
  label: string; // GitHub, Figma, Docs, etc.
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  notes?: string;
  links: ProjectLink[];
  milestones: Milestone[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

// Dashboard Stats
export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  atRisk: number;
  delayed: number;
}

// Project Template
export type ProjectTemplate = "Dashboard" | "Automation" | "PowerBI";

export interface ProjectTemplateConfig {
  name: string;
  description: string;
  category: ProjectCategory;
  milestones: Omit<Milestone, "id">[];
}

// Theme
export type Theme = "light" | "dark";

// Filter & Sort
export interface ProjectFilters {
  status?: ProjectStatus[];
  category?: ProjectCategory[];
  priority?: ProjectPriority[];
  searchQuery?: string;
}

export interface ProjectSort {
  field: "name" | "dueDate" | "progress" | "createdAt";
  direction: "asc" | "desc";
}

// Legacy API Response Types (kept for backward compatibility)
export interface ETLResponse {
  success: boolean;
  message: string;
  files_processed: number;
  output_file: string;
  sheets_created: string[];
  errors: string[];
  total_rows: Record<string, number>;
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  output_file: string;
  summary: unknown;
  details_count: number;
  change_stats: {
    up: number;
    down: number;
    same: number;
    new: number;
  };
}

export interface ProgressResponse {
  status: "idle" | "processing" | "completed" | "failed";
  progress: number;
  current_file: string | null;
  message: string;
}

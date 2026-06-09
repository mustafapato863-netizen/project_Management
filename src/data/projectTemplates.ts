import { ProjectTemplateConfig } from "@/types";

export const projectTemplates: Record<string, ProjectTemplateConfig> = {
  Dashboard: {
    name: "Dashboard Project",
    description: "Template for dashboard development projects",
    category: "Development",
    milestones: [
      {
        title: "Requirements & Design",
        description: "Gather requirements and create design mockups",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Frontend Development",
        description: "Implement dashboard components and features",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Integration & Testing",
        description: "Integrate with backend and perform testing",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Deployment",
        description: "Deploy to production",
        status: "Planned",
        dueDate: "",
      },
    ],
  },
  Automation: {
    name: "Automation Project",
    description: "Template for automation and scripting projects",
    category: "Development",
    milestones: [
      {
        title: "Process Analysis",
        description: "Analyze processes to be automated",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Script Development",
        description: "Develop automation scripts",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Testing & Validation",
        description: "Test scripts and validate results",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Deployment & Documentation",
        description: "Deploy scripts and document processes",
        status: "Planned",
        dueDate: "",
      },
    ],
  },
  PowerBI: {
    name: "Power BI Project",
    description: "Template for Power BI reports and dashboards",
    category: "Infrastructure",
    milestones: [
      {
        title: "Data Source Setup",
        description: "Configure data connections and sources",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Model & Transformation",
        description: "Create data models and transformations",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Report Development",
        description: "Develop reports and visualizations",
        status: "Planned",
        dueDate: "",
      },
      {
        title: "Publishing & Sharing",
        description: "Publish reports to Power BI Service",
        status: "Planned",
        dueDate: "",
      },
    ],
  },
};

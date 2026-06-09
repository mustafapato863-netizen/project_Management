import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/layout/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage";
import RoadmapPage from "./pages/RoadmapPage";
import { useProjectStore } from "./store/useProjectStore";

const SYNC_INTERVAL_MS = 10_000;

function App() {
  const loadProjects = useProjectStore((state) => state.loadProjects);
  const syncProjects = useProjectStore((state) => state.syncProjects);

  useEffect(() => {
    loadProjects();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        syncProjects();
      }
    }, SYNC_INTERVAL_MS);

    const handleFocus = () => {
      syncProjects();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadProjects, syncProjects]);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

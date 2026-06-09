import { Link, useLocation } from "react-router-dom";
import { Home, FolderOpen, Map, Settings } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/projects", icon: FolderOpen, label: "Projects" },
    { path: "/roadmap", icon: Map, label: "Roadmap" },
  ];

  const isPathActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 overflow-y-auto shadow-lg">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Project Manager
        </h1>
        <p className="text-xs text-slate-400">Portfolio & Milestone Tracker</p>
      </div>

      <nav className="p-4 space-y-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 py-2">
          Main
        </h2>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = isPathActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900">
        <button className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">
          <Settings size={20} />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

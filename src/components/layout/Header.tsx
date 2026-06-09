import React from "react";
import { Bell, Shield, Eye } from "lucide-react";
import SyncStatus from "./SyncStatus";
import { useUIStore } from "@/store/useUIStore";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const isAdmin = useUIStore((state) => state.isAdmin);
  const setIsAdmin = useUIStore((state) => state.setIsAdmin);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>

      <div className="flex items-center gap-4">
        <SyncStatus />
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} className="text-slate-600" />
        </button>
        <button
          onClick={() => setIsAdmin(!isAdmin)}
          title={`Click to switch to ${isAdmin ? "Viewer" : "Admin"} mode`}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 shadow-sm ${
            isAdmin
              ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          }`}
        >
          {isAdmin ? (
            <>
              <Shield size={16} className="text-blue-600 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider">Admin Mode</span>
            </>
          ) : (
            <>
              <Eye size={16} className="text-slate-500" />
              <span className="text-xs font-semibold uppercase tracking-wider">Viewer Mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

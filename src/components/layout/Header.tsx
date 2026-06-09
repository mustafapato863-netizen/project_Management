import React from "react";
import { Bell, User } from "lucide-react";
import SyncStatus from "./SyncStatus";

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>

      <div className="flex items-center gap-4">
        <SyncStatus />
        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={20} className="text-slate-600" />
        </button>
        <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <User size={20} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Admin</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";

const SyncStatus = () => {
  const isLoading = useProjectStore((state) => state.isLoading);
  const isSyncing = useProjectStore((state) => state.isSyncing);
  const error = useProjectStore((state) => state.error);
  const lastSyncedAt = useProjectStore((state) => state.lastSyncedAt);
  const syncProjects = useProjectStore((state) => state.syncProjects);

  const formatLastSync = () => {
    if (!lastSyncedAt) return "Not synced yet";

    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(lastSyncedAt));
  };

  return (
    <button
      type="button"
      onClick={() => syncProjects()}
      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
      title={error ?? "Click to refresh team data"}
    >
      {isLoading || isSyncing ? (
        <Loader2 size={14} className="animate-spin" />
      ) : error ? (
        <CloudOff size={14} className="text-red-500" />
      ) : (
        <Cloud size={14} className="text-green-600" />
      )}
      <span>{error ? "Offline" : `Team sync · ${formatLastSync()}`}</span>
    </button>
  );
};

export default SyncStatus;

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Filter,
  Download,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AlertDialog from "@/components/layout/AlertDialog";

// ✅ استدعاء الـ APIs المحدثة والمكون الموحد
import {
  listOutputFiles,
  downloadFile,
  readAnalysisFile,
  deleteOutputFile,
} from "@/services/api";
import ClassificationCards from "@/components/features/ClassificationCards";

interface OutputFile {
  filename: string;
  type: string;
  size: number;
}

interface AnalysisDetail {
  Sheet: string;
  ChangeDir: string;
  Agent_Name: string;
  HR_Code: string | number;
  Decision: string;
  PrevDecision?: string;
  Prev_Productivity_Ach?: number | null;
  Productivity_Ach?: number | null;
  Reason?: string;
}

const AnalysisPage: React.FC = () => {
  const [files, setFiles] = useState<OutputFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [details, setDetails] = useState<AnalysisDetail[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("All");
  const [selectedChangeDir, setSelectedChangeDir] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingFiles, setLoadingFiles] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ✅ قائمة كاملة بكل الفرق
  const sheets = [
    "All",
    "Inbound",
    "Outbound",
    "BackOffice",
    "Medical",
    "Medical_ER",
    "Digital_KSA",
    "Digital_Egypt",
  ];

  // 1. جلب قائمة التقارير المتاحة
  const loadFiles = useCallback(async () => {
    setLoadingFiles(true);
    try {
      const response = await listOutputFiles();
      let allFiles: OutputFile[] = [];
      if (Array.isArray(response)) {
        allFiles = response;
      } else if (response && typeof response === "object") {
        if (Array.isArray(response.files)) {
          allFiles = response.files;
        } else if (Array.isArray(response.data)) {
          allFiles = response.data;
        }
      }
      setFiles(allFiles);
      const latestSummary = allFiles.find((f: OutputFile) => f.type === "Summary");
      if (latestSummary && !selectedFile)
        setSelectedFile(latestSummary.filename);
    } catch {
      setError("Failed to load reports from server.");
    } finally {
      setLoadingFiles(false);
    }
  }, [selectedFile]);

  // 2. جلب بيانات التقرير المختار
  const loadAnalysisData = async (filename: string) => {
    setLoadingData(true);
    try {
      const data = await readAnalysisFile(filename);
      let detailsList: AnalysisDetail[] = [];
      if (data && typeof data === "object") {
        if (Array.isArray(data.details)) {
          detailsList = data.details;
        } else if (Array.isArray(data.data)) {
          detailsList = data.data;
        } else if (Array.isArray(data)) {
          detailsList = data;
        }
      }
      setDetails(detailsList);
    } catch {
      setError("Error reading the selected analysis file.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    if (selectedFile) loadAnalysisData(selectedFile);
  }, [selectedFile]);

  // 3. منطق الفلترة الموحد (البحث + الفريق + حالة التغيير)
  const filteredDetails = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const safeDetails = Array.isArray(details) ? details : [];
    return safeDetails.filter((item) => {
      const matchesSheet =
        selectedSheet === "All" || item.Sheet === selectedSheet;
      const matchesChangeDir =
        selectedChangeDir === "All" || item.ChangeDir === selectedChangeDir;
      const matchesSearch =
        term === "" ||
        String(item.Agent_Name ?? "")
          .toLowerCase()
          .includes(term) ||
        String(item.HR_Code ?? "")
          .toLowerCase()
          .includes(term);
      return matchesSheet && matchesChangeDir && matchesSearch;
    });
  }, [details, selectedSheet, selectedChangeDir, searchTerm]);

  // 4. حساب الإحصائيات الحية للكروت بناءً على البيانات المفلترة حالياً
  const dynamicClassificationStats = useMemo(() => {
    const current = { A: 0, B: 0, C: 0 };
    const previous = { A: 0, B: 0, C: 0 };
    const safeDetails = Array.isArray(filteredDetails) ? filteredDetails : [];
    safeDetails.forEach((item) => {
      const dec = String(item.Decision || "").toUpperCase();
      const prevDec = String(item.PrevDecision || "").toUpperCase();
      if (dec in current) current[dec as "A" | "B" | "C"]++;
      if (prevDec in previous) previous[prevDec as "A" | "B" | "C"]++;
    });
    return {
      current,
      previous,
      change: {
        A: current.A - previous.A,
        B: current.B - previous.B,
        C: current.C - previous.C,
      },
    };
  }, [filteredDetails]);

  // 5. حذف الملفات
  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOutputFile(fileToDelete);
      setFiles((prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return list.filter((f) => f.filename !== fileToDelete);
      });
      if (selectedFile === fileToDelete) {
        setSelectedFile(null);
        setDetails([]);
      }
      setSuccessMessage(`File deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setFileToDelete(null);
    } catch {
      setError("Failed to delete file. It might be locked by another process.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderProductivity = (
    prev: number | null | undefined,
    curr: number | null | undefined,
  ) => {
    if (prev === undefined || curr === undefined || prev === null || curr === null)
      return <span className="text-slate-400 text-xs">N/A</span>;
    const isImproved = curr > prev;
    const isDeclined = curr < prev;
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500">
          {(prev * 100).toFixed(0)}%
        </span>
        {isImproved ? (
          <TrendingUp className="h-3 w-3 text-green-600" />
        ) : isDeclined ? (
          <TrendingDown className="h-3 w-3 text-red-600" />
        ) : (
          <span className="text-slate-300">→</span>
        )}
        <span
          className={`text-sm font-bold ${
            isImproved ? "text-green-600" : isDeclined ? "text-red-600" : ""
          }`}
        >
          {(curr * 100).toFixed(0)}%
        </span>
      </div>
    );
  };

  if (loadingFiles && !selectedFile)
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="animate-spin text-purple-600" />
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      {/* التنبيهات (Toasts) */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {error && (
          <Alert
            variant="destructive"
            className="animate-in fade-in slide-in-from-top-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="bg-green-50 border-green-200 text-green-800 animate-in fade-in slide-in-from-top-4">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* الرأس واختيار التقرير */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <BarChart3 className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Analysis Hub</h1>
            <p className="text-sm text-slate-500">
              Corrective actions & performance trends
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none"
            value={selectedFile || ""}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            {files
              .filter((f) => f.type === "Summary")
              .map((f) => (
                <option key={f.filename} value={f.filename}>
                  {f.filename}
                </option>
              ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFiles}
            disabled={loadingFiles || loadingData}
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingFiles || loadingData ? "animate-spin" : ""}`}
            />
          </Button>
          {selectedFile && (
            <Button
              variant="default"
              size="sm"
              onClick={() => window.open(downloadFile(selectedFile), "_blank")}
            >
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          )}
        </div>
      </div>

      {/* ✅ استخدام المكون الموحد للكروت بناءً على الفلتر الحالي */}
      <ClassificationCards
        data={dynamicClassificationStats}
        titleSuffix={selectedSheet !== "All" ? ` (${selectedSheet})` : ""}
      />

      {/* ✅ الفلاتر الكاملة والجدول */}
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="space-y-4">
            {/* السطر الأول: البحث */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  className="pl-10 w-full border rounded-lg py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Search Agent or HR Code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* السطر الثاني: فلتر الفرق (كل الفرق السبعة) */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 mr-2">
                Team:
              </span>
              <div className="flex flex-wrap gap-1">
                {sheets.map((s) => (
                  <Button
                    key={s}
                    variant={selectedSheet === s ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSelectedSheet(s)}
                  >
                    {s === "Medical_ER" ? "Medical ER" : s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            {/* السطر الثالث: فلتر حالة التغيير */}
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-400 mr-2">
                Status:
              </span>
              <div className="flex gap-1">
                {["All", "up", "down", "same", "new"].map((dir) => (
                  <Button
                    key={dir}
                    variant={selectedChangeDir === dir ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSelectedChangeDir(dir)}
                  >
                    {dir === "up" && "⬆️ UP"}
                    {dir === "down" && "⬇️ DOWN"}
                    {dir === "same" && "➡️ SAME"}
                    {dir === "new" && "🆕 NEW"}
                    {dir === "All" && "All"}
                  </Button>
                ))}
              </div>
            </div>

            {/* عرض عدد النتائج */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-purple-600">
                  {filteredDetails.length}
                </span>{" "}
                of <span className="font-bold">{details.length}</span> agents
              </div>
              {(selectedSheet !== "All" ||
                selectedChangeDir !== "All" ||
                searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setSelectedSheet("All");
                    setSelectedChangeDir("All");
                    setSearchTerm("");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b text-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    Agent Details
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Decision Flow
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Productivity
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Primary Reason
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDetails.length > 0 ? (
                  filteredDetails.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {row.Agent_Name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] h-4 px-1"
                          >
                            {row.Sheet}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            ID: {row.HR_Code}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={
                            row.ChangeDir === "up"
                              ? "bg-green-100 text-green-700 hover:bg-green-100 border-none"
                              : row.ChangeDir === "down"
                                ? "bg-red-100 text-red-700 hover:bg-red-100 border-none"
                                : row.ChangeDir === "new"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-100 border-none"
                          }
                        >
                          {String(row.ChangeDir || "same").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {row.PrevDecision && (
                            <span className="text-slate-300 line-through font-medium">
                              {row.PrevDecision}
                            </span>
                          )}
                          <span className="text-slate-400">→</span>
                          <span className="font-black text-slate-800">
                            {String(row.Decision || "C").toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderProductivity(
                          row.Prev_Productivity_Ach,
                          row.Productivity_Ach,
                        )}
                      </td>
                      <td
                        className="px-6 py-4 text-xs font-medium text-slate-500 italic max-w-[300px]"
                        title={row.Reason}
                      >
                        <div className="line-clamp-2">
                          {row.Reason || "No reason provided"}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400 font-medium"
                    >
                      No agents found matching the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الملفات للحذف الإداري */}
      <Card className="border-red-100 bg-red-50/30">
        <CardHeader>
          <CardTitle className="text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Reports Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-50 hover:border-red-200 transition-all"
            >
              <div>
                <div className="font-semibold text-slate-700 text-sm">
                  {file.filename}
                </div>
                <div className="text-[10px] text-slate-400">
                  {file.type} • {(file.size / 1024).toFixed(0)} KB
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(downloadFile(file.filename), "_blank")
                  }
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setFileToDelete(file.filename)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* حوار تأكيد الحذف */}
      {fileToDelete && (
        <AlertDialog
          isOpen={true}
          title="Permanently Delete Report?"
          message={`This will remove "${fileToDelete}" from the server. This action cannot be undone.`}
          confirmLabel={isDeleting ? "Deleting..." : "Delete Report"}
          onCancel={() => !isDeleting && setFileToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default AnalysisPage;

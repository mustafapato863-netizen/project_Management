import axios from "axios";

// Determine API URL
const getAPIURL = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    const env = import.meta.env as Record<string, unknown>;
    if (typeof env.VITE_API_URL === "string") {
      let url = env.VITE_API_URL;
      if (url.startsWith("http") && !url.endsWith("/api") && !url.endsWith("/api/")) {
        url = url.replace(/\/$/, "") + "/api";
      }
      return url;
    }
  }
  return "/api";
};

const API_BASE_URL = getAPIURL();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * دالة مساعدة لتنظيف أسماء الملفات من المسارات الزائدة
 * تضمن إرسال اسم الملف فقط للباك إند لمنع أخطاء الـ 404
 */
const getCleanFilename = (filename: string): string => {
  if (!filename) return "";
  return filename
    .replace("/outputs/", "")
    .replace("/uploads/", "")
    .replace("outputs/", "")
    .replace("uploads/", "");
};

// ================== 1. ETL APIs (رفع ومعالجة الملفات) ==================

/**
 * رفع ملفات Excel للمعالجة
 */
export const uploadFiles = async (
  files: FileList,
  onProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress?.(percentCompleted);
      }
    },
  });

  return response.data;
};

/**
 * الحصول على حالة المعالجة الحالية
 */
export const getETLStatus = async () => {
  const response = await api.get("/status");
  return response.data;
};

/**
 * قائمة بكل الملفات المُنتجة (Weekly_Trend + Summary)
 */
export const listOutputFiles = async () => {
  const response = await api.get("/output-files");
  return response.data;
};

/**
 * حذف ملف من مجلد outputs
 */
export const deleteOutputFile = async (filename: string) => {
  const cleanName = getCleanFilename(filename);
  const response = await api.delete(`/output-files/${cleanName}`);
  return response.data;
};

/**
 * تحميل ملف (يرجع رابط مباشر)
 */
export const downloadFile = (filename: string) => {
  const cleanName = getCleanFilename(filename);
  // ✅ إزالة /api من الرابط لأن /outputs مربوط مباشرة في main.py
  return `${API_BASE_URL.replace("/api", "")}/outputs/${cleanName}`;
};

// ================== 2. Analysis APIs (تحليل البيانات والقرارات) ==================

/**
 * تشغيل تحليل Corrective Actions على Weekly_Trend
 */
export const runAnalysis = async (filename: string) => {
  const cleanName = getCleanFilename(filename);
  const response = await api.post("/analysis/run", null, {
    params: { weekly_trend_filename: cleanName },
  });
  return response.data;
};

/**
 * قراءة محتوى ملف Summary (يرجع top_issues + details + stats)
 */
export const readAnalysisFile = async (filename: string) => {
  const cleanName = getCleanFilename(filename);
  const response = await api.get(`/analysis/read/${cleanName}`);
  return response.data;
};

/**
 * إحصائيات الداشبورد الرئيسية
 */
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/analysis/stats");
    return response.data;
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      total_files_processed: 0,
      active_agents: 0,
      performance_trend: "0%",
      change_stats: { up: 0, down: 0, new: 0, same: 0 },
    };
  }
};

/**
 * توزيع التصنيفات A/B/C لكل الفرق
 */
export const getClassificationBreakdown = async (
  weeklyTrendFilename?: string,
) => {
  try {
    const params =
      weeklyTrendFilename && weeklyTrendFilename !== "latest"
        ? { weekly_trend_filename: getCleanFilename(weeklyTrendFilename) }
        : {};

    const response = await api.get("/analysis/classification-breakdown", {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Classification breakdown error:", error);
    return {
      total_agents: 0,
      by_team: {},
      overall: {
        current: { A: 0, B: 0, C: 0 },
        previous: { A: 0, B: 0, C: 0 },
        change: { A: 0, B: 0, C: 0 },
      },
    };
  }
};

// ================== 3. Digital Marketing APIs (خاص بفرق الديجيتال) ==================

/**
 * معلومات الفرق المتاحة
 */
export const getDigitalTeams = async () => {
  const response = await api.get("/digital/teams");
  return response.data;
};

/**
 * ملخص أداء فريق معين
 */
export const getDigitalTeamSummary = async (teamName: string) => {
  const response = await api.get(`/digital/teams/${teamName}/summary`);
  return response.data;
};

/**
 * أفضل الموظفين في فريق معين
 */
export const getDigitalTopPerformers = async (
  teamName: string,
  topN: number = 10,
) => {
  const response = await api.get(`/digital/teams/${teamName}/top-performers`, {
    params: { top_n: topN },
  });
  return response.data;
};

// ================== 4. Health Check ==================

/**
 * فحص صحة الـ API
 */
export const healthCheck = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch (error) {
    console.error("Health check failed:", error);
    return { status: "unhealthy" };
  }
};

export default api;

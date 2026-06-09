import React, { useState } from "react";
import axios from "axios";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  PlayCircle,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { uploadFiles, runAnalysis, downloadFile } from "@/services/api";

interface ETLResponse {
  files_processed: number;
  sheets_created: string[];
  total_rows: Record<string, number>;
  output_file: string;
}

interface AnalysisResponse {
  message: string;
  details_count: number;
  change_stats: {
    up: number;
    down: number;
    new: number;
    same: number;
  };
  output_file: string;
}

const UploadPage = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [etlResult, setEtlResult] = useState<ETLResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
      setEtlResult(null);
      setAnalysisResult(null);
      setError(null);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setError("Please select files first");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const response = await uploadFiles(files, (progress) => {
        setUploadProgress(progress);
      });
      setEtlResult(response);
      setFiles(null);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail || err.message || "Upload failed",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Upload failed");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!etlResult?.output_file) return;

    setAnalyzing(true);
    setError(null);

    try {
      const response = await runAnalysis(etlResult.output_file);
      setAnalysisResult(response);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.detail || err.message || "Analysis failed",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Analysis failed");
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleClear = () => {
    setFiles(null);
    setEtlResult(null);
    setAnalysisResult(null);
    setError(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload Weekly Reports</span>
            {(etlResult || files) && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              uploading
                ? "border-purple-400 bg-purple-50"
                : "border-slate-300 hover:border-purple-400"
            }`}
          >
            <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Select Excel Files
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Choose weekly performance reports (Inbound, Outbound, BackOffice,
              Medical, Digital)
            </p>

            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              <Button
                variant="outline"
                className="pointer-events-none"
                disabled={uploading}
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </label>

            {files && files.length > 0 && (
              <div className="mt-6 space-y-2">
                <div className="text-sm font-medium text-slate-700">
                  Selected Files ({files.length}):
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Array.from(files).map((file, idx) => (
                    <Badge key={idx} variant="secondary">
                      {file.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Processing files...</span>
                <span className="font-medium text-slate-900">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          {files && files.length > 0 && !etlResult && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
              size="lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing... {uploadProgress}%
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload & Process Files
                </>
              )}
            </Button>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* ETL Results Card */}
      {etlResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              ETL Processing Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">
                  Files Processed
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {etlResult.files_processed || 0}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-1">
                  Sheets Created
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {etlResult.sheets_created?.length || 0}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 font-medium mb-1">
                  Total Rows
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {etlResult.total_rows
                    ? Object.values(
                        etlResult.total_rows as Record<string, number>,
                      ).reduce((a: number, b: number) => a + b, 0)
                    : 0}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">
                Sheets Created:
              </div>
              <div className="flex flex-wrap gap-2">
                {(etlResult.sheets_created as string[])?.map(
                  (sheet: string) => (
                    <Badge key={sheet} variant="outline">
                      {sheet}:{" "}
                      {(etlResult.total_rows as Record<string, number>)?.[
                        sheet
                      ] || 0}{" "}
                      rows
                    </Badge>
                  ),
                ) || <span className="text-sm text-slate-500">No sheets</span>}
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  window.open(downloadFile(etlResult.output_file), "_blank")
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download Weekly Trend
              </Button>
              <Button
                className="flex-1"
                onClick={handleRunAnalysis}
                disabled={analyzing}
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Run Corrective Actions Analysis
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results Card */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {analysisResult.message} - {analysisResult.details_count || 0}{" "}
                changes detected
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-900">
                  {analysisResult.change_stats?.up || 0}
                </div>
                <div className="text-sm text-green-600 font-medium mt-1">
                  Promoted ↑
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-red-900">
                  {analysisResult.change_stats?.down || 0}
                </div>
                <div className="text-sm text-red-600 font-medium mt-1">
                  Demoted ↓
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-blue-900">
                  {analysisResult.change_stats?.new || 0}
                </div>
                <div className="text-sm text-blue-600 font-medium mt-1">
                  New Entries
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-slate-900">
                  {analysisResult.change_stats?.same || 0}
                </div>
                <div className="text-sm text-slate-600 font-medium mt-1">
                  Unchanged
                </div>
              </div>
            </div>

            <Button
              variant="default"
              className="w-full"
              size="lg"
              onClick={() =>
                window.open(downloadFile(analysisResult.output_file), "_blank")
              }
            >
              <Download className="mr-2 h-4 w-4" />
              Download Analysis Report (Summary + Details)
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;

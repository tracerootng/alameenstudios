import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, Image } from "lucide-react";

export interface UploadFile {
  id: string;
  file: File;
  status: "queued" | "uploading" | "complete" | "failed" | "retrying";
  progress: number;
  error?: string;
  retryCount?: number;
  previewUrl?: string;
}

interface UploadProgressProps {
  files: UploadFile[];
  onRetry: (fileId: string) => void;
  onRetryAll: () => void;
  onCancel: () => void;
  isUploading: boolean;
  slowConnection?: boolean;
}

export function UploadProgress({
  files,
  onRetry,
  onRetryAll,
  onCancel,
  isUploading,
  slowConnection = false,
}: UploadProgressProps) {
  const completedCount = files.filter((f) => f.status === "complete").length;
  const failedCount = files.filter((f) => f.status === "failed").length;
  const totalCount = files.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  return (
    <div className="space-y-4">
      {/* Overall Progress Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : failedCount > 0 ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <Check className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isUploading
                ? `Uploading ${completedCount + 1} of ${totalCount}`
                : failedCount > 0
                ? `${completedCount} uploaded, ${failedCount} failed`
                : `${completedCount} photos uploaded`}
            </p>
            <p className="text-xs text-muted-foreground">
              Total size: {formatFileSize(totalSize)}
            </p>
          </div>
        </div>

        {isUploading && (
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Slow Connection Warning */}
      <AnimatePresence>
        {slowConnection && isUploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs"
          >
            <WifiOff className="w-4 h-4 flex-shrink-0" />
            <span>Slow connection detected. Uploads may take longer than usual.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Progress Bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${overallProgress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* File List */}
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {files.map((file, index) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.02 }}
            className={`flex items-center gap-3 p-2 border transition-colors ${
              file.status === "failed"
                ? "border-red-500/30 bg-red-500/5"
                : file.status === "complete"
                ? "border-green-500/30 bg-green-500/5"
                : "border-primary/10 bg-card/50"
            }`}
          >
            {/* Thumbnail Preview */}
            <div className="w-10 h-10 bg-muted flex-shrink-0 overflow-hidden">
              {file.previewUrl ? (
                <img
                  src={file.previewUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground truncate">{file.file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(file.file.size)}
                </span>
                {file.status === "uploading" && (
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                    />
                  </div>
                )}
                {file.status === "retrying" && file.retryCount && (
                  <span className="text-[10px] text-amber-500">
                    Retry {file.retryCount}/3
                  </span>
                )}
              </div>
            </div>

            {/* Status Icon */}
            <div className="flex-shrink-0">
              {file.status === "queued" && (
                <div className="w-5 h-5 rounded-full border border-muted-foreground/30" />
              )}
              {file.status === "uploading" && (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              )}
              {file.status === "retrying" && (
                <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
              )}
              {file.status === "complete" && (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              {file.status === "failed" && (
                <button
                  onClick={() => onRetry(file.id)}
                  className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title={file.error || "Upload failed. Click to retry."}
                >
                  <RefreshCw className="w-3 h-3 text-white" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Failed Files Actions */}
      {failedCount > 0 && !isUploading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20"
        >
          <p className="text-xs text-red-500">
            {failedCount} file{failedCount > 1 ? "s" : ""} failed to upload
          </p>
          <button
            onClick={onRetryAll}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Retry All
          </button>
        </motion.div>
      )}
    </div>
  );
}

// Upload utility with retry logic
export async function uploadWithRetry(
  file: File,
  uploadFn: (file: File) => Promise<string>,
  options: {
    maxRetries?: number;
    timeout?: number;
    onProgress?: (progress: number) => void;
    onRetrying?: (attempt: number) => void;
  } = {}
): Promise<{ success: boolean; path?: string; error?: string }> {
  const { maxRetries = 3, timeout = 30000, onRetrying } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const path = await Promise.race([
        uploadFn(file),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error("Upload timed out"));
          });
        }),
      ]);

      clearTimeout(timeoutId);
      return { success: true, path };
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const errorMessage = error instanceof Error ? error.message : "Upload failed";

      if (isLastAttempt) {
        return { success: false, error: errorMessage };
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      onRetrying?.(attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: "Max retries exceeded" };
}

// Hook for detecting slow connection
export function useSlowConnection(threshold = 5000): boolean {
  const [isSlow, setIsSlow] = useState(false);
  const [uploadStart, setUploadStart] = useState<number | null>(null);

  useEffect(() => {
    if (uploadStart) {
      const timer = setTimeout(() => setIsSlow(true), threshold);
      return () => clearTimeout(timer);
    } else {
      setIsSlow(false);
    }
  }, [uploadStart, threshold]);

  return isSlow;
}

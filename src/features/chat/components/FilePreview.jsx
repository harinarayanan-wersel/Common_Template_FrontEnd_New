import { useEffect, useMemo, useCallback } from "react";
import { X, FileText, Image as ImageIcon, File, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const getFileIcon = (fileType) => {
  switch (fileType) {
    case "document":
      return FileText;
    case "image":
      return ImageIcon;
    default:
      return File;
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const FilePreview = ({ files, onRemove }) => {
  if (!files || files.length === 0) return null;

  // Create object URLs for files that have blob data and clean them up
  const fileUrls = useMemo(() => {
    const urls = new Map();
    files.forEach((file, index) => {
      if (file?.file instanceof Blob) {
        try {
          urls.set(index, URL.createObjectURL(file.file));
        } catch {
          // ignore URL creation failures
        }
      }
    });
    return urls;
  }, [files]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      fileUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore revoke failures
        }
      });
    };
  }, [fileUrls]);

  const handlePreview = useCallback(
    (index) => {
      const url = fileUrls.get(index);
      if (!url || typeof window === "undefined") return;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [fileUrls]
  );

  return (
    <div className="border-t border-border/80 bg-background px-4 py-2">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {files.map((file, index) => {
          if (!file) return null;
          const Icon = getFileIcon(file.type || "file");
          const isImage = file.type === "image" && fileUrls.has(index);
          const previewUrl = fileUrls.get(index);
          const isUploading = file.status === "uploading";
          const progressValue = Math.round(file.progress || 0);

          return (
            <div
              key={index}
              className="flex min-w-[220px] max-w-[240px] flex-col gap-2 rounded-xl border border-border/50 bg-background/80 p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                {isImage && previewUrl ? (
                  <div className="relative h-10 w-10 overflow-hidden rounded-md border border-border/60">
                    <img
                      src={previewUrl}
                      alt={file.name || "Image"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border/60 bg-muted/40">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.name || "Untitled file"}
                  </p>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatFileSize(file.size || 0)}
                  </p>
                </div>
              </div>
              {isUploading ? (
                <div className="space-y-1">
                  <div className="h-[3px] rounded-full bg-border/40">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Uploading {progressValue}%</p>
                </div>
              ) : previewUrl ? (
                <button
                  type="button"
                  onClick={() => handlePreview(index)}
                  className="text-[11px] font-medium text-primary hover:text-primary/80 transition-colors text-left"
                >
                  Preview file
                </button>
              ) : null}
              {onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="self-end text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};


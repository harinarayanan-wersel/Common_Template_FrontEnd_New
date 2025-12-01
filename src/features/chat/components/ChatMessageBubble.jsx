import { memo, useMemo, useEffect, useCallback } from "react";
import { FileText, Image as ImageIcon, File, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

const AI_AVATAR =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=facearea&w=200&h=200&q=80";
const USER_AVATAR =
  "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=facearea&w=200&h=200&q=80";

export const ChatMessageBubble = memo(({ message }) => {
  const isUser = message.sender === "user";
  return (
    <div
      className={cn(
        "flex w-full items-start gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={AI_AVATAR} alt="AI Assistant" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm shadow-sm text-left space-y-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-muted text-foreground"
          )}
        >
          {message.isTyping ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium tracking-wide">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/80 animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/70 animate-pulse delay-150" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground/60 animate-pulse delay-300" />
            </span>
          ) : (
            <>
              {message.attachments && message.attachments.length > 0 && (
                <AttachmentList
                  attachments={message.attachments}
                  isUser={isUser}
                />
              )}
              {message.content && (
                <span className="whitespace-pre-line">{message.content}</span>
              )}
            </>
          )}
        </div>
        <span className="text-[11px] uppercase font-semibold text-muted-foreground">
          {message.isTyping ? "Typing..." : formatTimestamp(message.timestamp)}
        </span>
      </div>
      {isUser && <div className="w-8" />}
    </div>
  );
});

ChatMessageBubble.displayName = "ChatMessageBubble";

// Separate component for attachments to handle object URL cleanup
const AttachmentList = ({ attachments, isUser }) => {
  // Create object URLs for images and clean them up
  const imageUrls = useMemo(() => {
    const urls = new Map();
    attachments.forEach((attachment, index) => {
      if (attachment?.file instanceof Blob) {
        try {
          urls.set(index, URL.createObjectURL(attachment.file));
        } catch (error) {
          console.warn("Failed to create object URL for attachment:", error);
        }
      }
    });
    return urls;
  }, [attachments]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imageUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.warn("Failed to revoke object URL:", error);
        }
      });
    };
  }, [imageUrls]);

  const handlePreview = useCallback(
    (index) => {
      if (typeof window === "undefined") return;
      const url = imageUrls.get(index);
      if (!url) return;
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [imageUrls]
  );

  return (
    <div className={cn("flex flex-wrap gap-2", isUser ? "justify-end" : "justify-start")}>
      {attachments.map((attachment, index) => {
        if (!attachment) return null;
        const Icon = getFileIcon(attachment.type || "file");
        const hasFile = attachment?.file instanceof Blob;
        const isImage = attachment.type === "image" && hasFile && imageUrls.has(index);
        const previewUrl = hasFile ? imageUrls.get(index) : attachment.url;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 rounded-lg border p-2 max-w-xs",
              isUser
                ? "bg-primary-foreground/10 border-primary-foreground/20"
                : "bg-background border-border"
            )}
          >
            {isImage && previewUrl ? (
              <div className="relative h-12 w-12 overflow-hidden rounded">
                <img
                  src={previewUrl}
                  alt={attachment.name || "Image"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded",
                isUser ? "bg-primary-foreground/10" : "bg-muted"
              )}>
                <Icon className={cn(
                  "h-6 w-6",
                  isUser ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-xs font-medium truncate",
                isUser ? "text-primary-foreground" : "text-foreground"
              )}>
                {attachment.name || "Unknown file"}
              </p>
              <p className={cn(
                "text-xs",
                isUser ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {formatFileSize(attachment.size || 0)}
              </p>
            </div>
            {(previewUrl || attachment.url) && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  const targetUrl = previewUrl || attachment.url;
                  if (targetUrl) {
                    window.open(targetUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className={cn(
                  "text-xs inline-flex items-center gap-1 rounded px-2 py-1 transition-colors",
                  isUser
                    ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Eye className="h-3 w-3" />
                Preview
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};


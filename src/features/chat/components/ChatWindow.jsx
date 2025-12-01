import { memo, useMemo, useRef, useEffect, useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ChatInput } from "./ChatInput";

const messageSkeletons = Array.from({ length: 5 }, (_, index) => index);

const createTempId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const ChatWindow = memo(
  ({ chat, messages = [], status, isTyping, isMobile, onBack, onSendMessage }) => {
    const scrollAreaRef = useRef(null);
    const messagesEndRef = useRef(null);
    const isUserScrollingRef = useRef(false);
    const scrollTimeoutRef = useRef(null);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const uploadIntervalsRef = useRef(new Map());

    const clearUploadInterval = useCallback((fileId) => {
      const interval = uploadIntervalsRef.current.get(fileId);
      if (interval) {
        clearInterval(interval);
        uploadIntervalsRef.current.delete(fileId);
      }
    }, []);

    const startUploadProgress = useCallback(
      (fileId) => {
        if (uploadIntervalsRef.current.has(fileId)) return;
        const interval = setInterval(() => {
          let shouldClear = false;
          setUploadedFiles((prev) =>
            prev.map((file) => {
              if (file.id !== fileId) return file;
              const increment = Math.random() * 18 + 7;
              const nextProgress = Math.min((file.progress || 0) + increment, 100);
              if (nextProgress >= 100) {
                shouldClear = true;
              }
              return {
                ...file,
                progress: nextProgress,
                status: nextProgress >= 100 ? "ready" : "uploading",
              };
            })
          );
          if (shouldClear) {
            clearUploadInterval(fileId);
          }
        }, 250);
        uploadIntervalsRef.current.set(fileId, interval);
      },
      [clearUploadInterval]
    );

    const typingMessage = useMemo(
      () =>
        isTyping
          ? [
              {
                id: "typing-indicator",
                sender: "ai",
                content: "",
                timestamp: new Date().toISOString(),
                isTyping: true,
              },
            ]
          : [],
      [isTyping]
    );

    const messagesToRender = [...messages, ...typingMessage];
    const showEmptyState = status === "success" && !chat;
    const showNoMessages = chat && status === "success" && messages.length === 0 && !typingMessage.length;

    // Get the viewport element from ScrollArea
    const getViewport = () => {
      if (!scrollAreaRef.current) return null;
      // Radix ScrollArea viewport is a direct child
      return scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') ||
             scrollAreaRef.current.firstElementChild;
    };

    // Auto-scroll to bottom when messages change
    useEffect(() => {
      if (isUserScrollingRef.current) return;

      const scrollToBottom = () => {
        const viewport = getViewport();
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      };

      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }, [messagesToRender.length, isTyping]);

    // Handle user scroll detection
    useEffect(() => {
      const viewport = getViewport();
      if (!viewport) return;

      const handleScroll = () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        isUserScrollingRef.current = true;

        // Check if user is near bottom (within 150px)
        const isNearBottom =
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 150;

        // If user scrolls back to bottom, re-enable auto-scroll
        scrollTimeoutRef.current = setTimeout(() => {
          if (isNearBottom) {
            isUserScrollingRef.current = false;
          }
        }, 200);
      };

      viewport.addEventListener("scroll", handleScroll, { passive: true });
      return () => {
        viewport.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, [messagesToRender.length]);

    useEffect(() => {
      return () => {
        uploadIntervalsRef.current.forEach((interval) => clearInterval(interval));
        uploadIntervalsRef.current.clear();
      };
    }, []);

    return (
      <div className="flex h-full flex-col bg-background">
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          {isMobile && (
            <Button variant="ghost" size="sm" className="px-2" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to conversations</span>
            </Button>
          )}
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">AI Assistant</p>
            <p className="text-sm font-semibold text-foreground">
              {chat?.title || "Start a new conversation"}
            </p>
          </div>
        </div>

        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6">
          {status === "loading" && (
            <div className="space-y-4">
              {messageSkeletons.map((key) => (
                <div
                  key={`skeleton-${key}`}
                  className={cn("flex flex-col gap-2", key % 2 ? "items-end" : "items-start")}
                >
                  <Skeleton className="h-14 w-3/4 rounded-2xl" />
                  <Skeleton className="h-3 w-16 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {showEmptyState && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-base font-medium">Start a new conversation</p>
              <p className="text-sm mt-1">Ask anything and your AI assistant will respond here.</p>
            </div>
          )}

          {showNoMessages && (
            <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
              <p className="text-base font-medium">No messages yet</p>
              <p className="text-sm mt-1">Send the first prompt to kick things off.</p>
            </div>
          )}

          {chat && status === "success" && (
            <div className="flex flex-col gap-4">
              {messagesToRender.map((message) => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="shrink-0">
          <ChatInput
            onSend={(message, files) => {
              onSendMessage(message, files);
            }}
            disabled={status === "loading"}
            onUpload={(fileData) => {
              if (!fileData) return;
              const newFile = {
                ...fileData,
                id: createTempId(),
                progress: 0,
                status: "uploading",
              };
              setUploadedFiles((prev) => [...prev, newFile]);
              startUploadProgress(newFile.id);
            }}
            uploadedFiles={uploadedFiles}
            onRemoveFile={(index) => {
              const fileToRemove = uploadedFiles[index];
              if (fileToRemove) {
                clearUploadInterval(fileToRemove.id);
              }
              setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
            }}
            onClearFiles={() => {
              uploadIntervalsRef.current.forEach((interval) => clearInterval(interval));
              uploadIntervalsRef.current.clear();
              setUploadedFiles([]);
            }}
          />
        </div>
      </div>
    );
  }
);

ChatWindow.displayName = "ChatWindow";


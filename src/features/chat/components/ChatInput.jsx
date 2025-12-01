import { useRef, useState } from "react";
import { ArrowUp, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FilePreview } from "./FilePreview";

const getFileType = (file) => {
  if (!file || !file.type) return "file";
  if (file.type.startsWith("image/")) return "image";
  if (
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "text/plain" ||
    file.type === "application/rtf"
  ) {
    return "document";
  }
  return "file";
};

export const ChatInput = ({
  onSend,
  disabled,
  onUpload,
  uploadedFiles,
  onRemoveFile,
  onClearFiles,
}) => {
  const [value, setValue] = useState("");
  const fileInputRef = useRef(null);

  const sendMessage = () => {
    if (!value.trim() && (!uploadedFiles || uploadedFiles.length === 0)) return;
    onSend(value, uploadedFiles || []);
    setValue("");
    onClearFiles?.();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      if (file && file.name) {
        const fileType = getFileType(file);
        onUpload?.({
          file,
          name: file.name,
          size: file.size || 0,
          type: fileType,
        });
      }
    });
    event.target.value = "";
  };

  const hasContent = value.trim() || (uploadedFiles && uploadedFiles.length > 0);

  return (
    <>
      {uploadedFiles && uploadedFiles.length > 0 && (
        <FilePreview files={uploadedFiles} onRemove={onRemoveFile} />
      )}
      <form onSubmit={handleSubmit} className="border-t border-border bg-background/80 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleUploadClick}
            disabled={disabled}
            className="h-11 w-11 rounded-full"
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Textarea
            value={value}
            disabled={disabled}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask, Search or Chat..."
            rows={1}
            className="flex-1 h-11 min-h-0 resize-none text-sm"
          />
          <Button
            type="submit"
            disabled={disabled || !hasContent}
            size="icon"
            className="h-11 w-11 rounded-full shrink-0"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />
        </div>
      </form>
    </>
  );
};


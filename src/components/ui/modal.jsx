import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Modal = ({ isOpen, onClose, children, className, ...props }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
      {...props}
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-t-3xl bg-background/95 p-6 shadow-2xl sm:rounded-2xl dark:border dark:border-[#24304a] dark:bg-[#111a2d]",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full hover:bg-accent/40 dark:text-gray-300 dark:hover:bg-[#1a2642]"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        {children}
      </div>
    </div>
  );
};

const ModalHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
ModalHeader.displayName = "ModalHeader";

const ModalTitle = ({ className, ...props }) => (
  <h2
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
);
ModalTitle.displayName = "ModalTitle";

const ModalDescription = ({ className, ...props }) => (
  <p
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
);
ModalDescription.displayName = "ModalDescription";

const ModalContent = ({ className, ...props }) => (
  <div className={cn("mt-4", className)} {...props} />
);
ModalContent.displayName = "ModalContent";

const ModalFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6",
      className
    )}
    {...props}
  />
);
ModalFooter.displayName = "ModalFooter";

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter };


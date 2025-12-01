import { cn } from "@/lib/utils";

/**
 * Professional Spinner Component
 * Used across all pages for loading states
 */
export const Spinner = ({ className, size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

/**
 * Full Page Spinner - Centered on screen
 */
export const FullPageSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

/**
 * Button Spinner - For buttons during loading
 */
export const ButtonSpinner = ({ className }) => {
  return <Spinner size="sm" className={cn("text-primary-foreground", className)} />;
};


import { Sidebar } from "./Sidebar.jsx";
import { cn } from "@/lib/utils";

export const MobileMenu = ({ open, onOpenChange }) => {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ease-in-out",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Overlay with fade animation */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Sidebar with slide animation */}
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-full max-w-[280px] transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          showCloseButton
          onClose={() => onOpenChange(false)}
          onNavigate={() => onOpenChange(false)}
          className="h-full rounded-r-2xl bg-white dark:bg-[#0c1427]"
          variant="mobile"
        />
      </div>
    </div>
  );
};

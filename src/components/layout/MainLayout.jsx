import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";
import { Header } from "./Header.jsx";
import { MobileMenu } from "./MobileMenu.jsx";
import { useResponsive } from "@/hooks/useResponsive";
import { cn } from "@/lib/utils";

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isMobile } = useResponsive();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!isMobile) {
      setMobileOpen(false);
    }
  }, [isMobile]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground dark:bg-[#0a1224] dark:text-gray-100">
      <Sidebar
        collapsed={sidebarCollapsed}
        className="hidden lg:flex"
        onNavigate={() => setMobileOpen(false)}
      />

      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />

      <Header
        onMenuClick={() => setMobileOpen(true)}
        onSidebarToggle={() => setSidebarCollapsed((prev) => !prev)}
        sidebarCollapsed={sidebarCollapsed}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col pt-[72px]",
          sidebarCollapsed ? "lg:pl-24" : "lg:pl-[288px]"
        )}
      >
        <main className="flex-1 overflow-y-auto bg-muted/20 px-4 py-6 md:px-8 lg:px-12 dark:bg-transparent">
          <div className="mx-auto w-full space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

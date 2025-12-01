import { useEffect, useState } from "react";
import {
  Menu,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
  SunMedium,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Maximize,
  Minimize,
  Bell,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";

export const Header = ({ onMenuClick, onSidebarToggle, sidebarCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {});
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    } catch (error) {}
  };

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        )
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-[72px] border-b border-border bg-background transition-[left] duration-300",
        sidebarCollapsed ? "lg:left-24" : "lg:left-[288px]"
      )}
    >
      <div className="flex h-full w-full items-center justify-between px-6">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 flex-1">
          {/* Hamburger Menu - Mobile */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer lg:hidden"
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Sidebar Toggle - Desktop */}
          <button
            type="button"
            onClick={onSidebarToggle}
            aria-label="Toggle sidebar"
            className="hidden lg:flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-5 w-5 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* Search Bar - Trezo Style */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl w-80 ml-3">
            <Search className="h-4 w-4 text-primary flex-shrink-0 pointer-events-none" />
            <input
              type="text"
              aria-label="Search"
              placeholder="Search here…"
              className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            {mounted && theme === "dark" ? (
              <SunMedium className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Maximize className="h-5 w-5 text-muted-foreground" />
            )}
          </button>

          {/* Notifications Bell with Badge */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>

          {/* User Avatar with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-gray-100 rounded-full px-2 py-1">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage
                    src="https://i.pravatar.cc/150?img=47"
                    alt="Olivia"
                  />
                  <AvatarFallback>Ol</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col leading-tight text-left">
                  <span className="text-sm font-semibold text-foreground">
                    Olivia
                  </span>
                </div>
                <ChevronDown className="hidden md:block h-4 w-4 text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* User Profile Section */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-border">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage
                    src="https://i.pravatar.cc/150?img=47"
                    alt="Olivia John"
                  />
                  <AvatarFallback>OJ</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">
                    Olivia John
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Marketing Manager
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-destructive cursor-pointer"
                  onSelect={(event) => {
                    event.preventDefault();
                    handleLogout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

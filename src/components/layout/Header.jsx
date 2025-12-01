import { useEffect, useState, useRef } from "react";
import {
  Menu,
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
  Globe,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Keyboard,
  PlayCircle,
  Bug,
  MessageSquare,
  Info,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  Calendar,
  X,
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
import "./Header.css";

export const Header = ({ onMenuClick, onSidebarToggle, sidebarCollapsed }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef(null);
  const { logout } = useAuth();

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "zh", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "hi", name: "Hindi" },
    { code: "ar", name: "Arabic" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "it", name: "Italian" },
    { code: "ko", name: "Korean" },
  ];

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    // Add your language change logic here
  };

  const helpMenuItems = [
    { icon: BookOpen, label: "Help Center", action: () => console.log("Help Center") },
    { icon: MessageCircle, label: "Contact Support", action: () => console.log("Contact Support") },
    { icon: HelpCircle, label: "FAQ", action: () => console.log("FAQ") },
    { icon: Keyboard, label: "Keyboard Shortcuts", action: () => console.log("Keyboard Shortcuts") },
    { icon: PlayCircle, label: "Getting Started", action: () => console.log("Getting Started") },
    { icon: Bug, label: "Report a Bug", action: () => console.log("Report a Bug") },
    { icon: MessageSquare, label: "Send Feedback", action: () => console.log("Send Feedback") },
    { icon: Info, label: "About", action: () => console.log("About") },
  ];

  const notifications = [
    {
      id: 1,
      type: "success",
      icon: CheckCircle,
      title: "Task Completed",
      message: "Your project has been successfully submitted",
      time: "2 minutes ago",
      unread: true,
    },
    {
      id: 2,
      type: "info",
      icon: Mail,
      title: "New Message",
      message: "You have received a new message from John Doe",
      time: "15 minutes ago",
      unread: true,
    },
    {
      id: 3,
      type: "warning",
      icon: AlertCircle,
      title: "Reminder",
      message: "Your meeting starts in 30 minutes",
      time: "1 hour ago",
      unread: false,
    },
    {
      id: 4,
      type: "calendar",
      icon: Calendar,
      title: "Event Scheduled",
      message: "Team standup meeting at 10:00 AM",
      time: "2 hours ago",
      unread: false,
    },
    {
      id: 5,
      type: "error",
      icon: XCircle,
      title: "Action Required",
      message: "Please update your profile information",
      time: "3 hours ago",
      unread: true,
    },
  ];

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
        }).catch(() => { });
      } else {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => { });
      }
    } catch (error) { }
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

  // Handle click outside search bar to collapse on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSearchExpanded &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isSearchExpanded]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-[72px] border-b border-border bg-background transition-[left] duration-300",
        sidebarCollapsed ? "lg:left-[72px]" : "lg:left-[256px]"
      )}
    >
      <div className="flex h-full w-full items-center justify-between px-6">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-3 flex-1">
          {/* Search Icon - Mobile collapsed state */}
          {!isSearchExpanded && (
            <button
              type="button"
              onClick={() => setIsSearchExpanded(true)}
              className="md:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted transition"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          {/* Search Bar - Trezo Style */}
          <div
            ref={searchRef}
            className={cn(
              "flex items-center gap-2 bg-muted border border-border rounded-xl transition-all duration-300",
              "md:flex md:px-4 md:py-2 md:w-[45%] md:relative",
              isSearchExpanded
                ? "fixed left-4 right-4 top-4 z-50 px-4 py-2 flex"
                : "hidden"
            )}
          >
            <Search className="h-4 w-4 text-primary flex-shrink-0 pointer-events-none" />
            <input
              type="text"
              aria-label="Search"
              placeholder="What are you looking for today?.."
              className="bg-transparent outline-none w-full text-sm text-foreground placeholder:text-muted-foreground"
              autoFocus={isSearchExpanded}
            />
            {/* Close button - Mobile only */}
            {isSearchExpanded && (
              <button
                type="button"
                onClick={() => setIsSearchExpanded(false)}
                className="md:hidden h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted/80 transition"
                aria-label="Close search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div
          className={cn(
            "flex items-center gap-2 ml-4 transition-opacity duration-300",
            isSearchExpanded ? "md:flex hidden" : "flex"
          )}
        >
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="group h-10 w-10 flex items-center justify-center rounded-full transition cursor-pointer"
          >
            {mounted && theme === "dark" ? (
              <SunMedium className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="group h-10 w-10 flex items-center justify-center rounded-full transition cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
            ) : (
              <Maximize className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
            )}
          </button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Notifications"
                className="group relative h-10 w-10 flex items-center justify-center rounded-full transition cursor-pointer"
              >
                <Bell className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                <button className="text-xs text-primary hover:underline">
                  Mark all as read
                </button>
              </div>

              {/* Notifications List */}
              <div className="py-1">
                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    const iconColor =
                      notification.type === "success"
                        ? "text-green-500"
                        : notification.type === "error"
                        ? "text-red-500"
                        : notification.type === "warning"
                        ? "text-yellow-500"
                        : "text-blue-500";

                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border last:border-b-0",
                          notification.unread && "bg-accent/50"
                        )}
                      >
                        <div className={cn("mt-0.5", iconColor)}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-foreground">
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2">
                  <button className="w-full text-center text-xs text-primary hover:underline">
                    View all notifications
                  </button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Help Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group h-10 w-10 flex items-center justify-center rounded-full transition cursor-pointer"
                aria-label="Help"
              >
                <HelpCircle className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="py-1">
                {helpMenuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <DropdownMenuItem
                      key={index}
                      onClick={item.action}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group h-10 w-10 flex items-center justify-center rounded-full transition cursor-pointer"
                aria-label="Select language"
              >
                <Globe className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-hover:scale-110" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="py-1">
                {languages.map((language) => (
                  <DropdownMenuItem
                    key={language.code}
                    onClick={() => handleLanguageChange(language.name)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer",
                      selectedLanguage === language.name && "bg-accent"
                    )}
                  >
                    <span className="flex-1">{language.name}</span>
                    {selectedLanguage === language.name && (
                      <span className="text-primary">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group h-10 w-10 flex items-center justify-center rounded-full transition cursor-pointer p-0"
              >
                <Avatar className="h-10 w-10 border-2 border-primary/20 transition-transform duration-200 group-hover:scale-110">
                  <AvatarImage src="https://i.pravatar.cc/150?img=47" alt="Olivia" />
                  <AvatarFallback>Ol</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {/* User Profile Section */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b border-border">
                <Avatar className="h-12 w-12 border-2 border-primary/20">
                  <AvatarImage
                    src="https://i.pravatar.cc/150?img=47"
                    alt="User"
                  />
                  <AvatarFallback>U</AvatarFallback>
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
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
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

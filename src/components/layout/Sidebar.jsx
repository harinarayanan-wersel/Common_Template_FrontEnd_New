import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/app/constants";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ChevronRight,
  Dot,
  Users,
  MessageCircle,
  LayoutGrid,
  FileText,
  Settings,
  AppWindow,
  ShoppingCart,
  Briefcase,
  KanbanSquare,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { usePermissions } from "@/hooks/usePermissions.js";

const NAVIGATION = [
  {
    label: "MAIN",
    items: [
      {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: ROUTES.DASHBOARD,
      },
      {
        title: "Users",
        icon: Users,
        href: ROUTES.USERS,
        permission: "usermanagement_access",
      },
      {
        title: "Chat",
        icon: MessageCircle,
        href: ROUTES.CHAT,
        permission: "ai_chat_access",
      },
      {
        title: "Layout",
        icon: LayoutGrid,
        href: "#layout",
      },
      {
        title: "Front Pages",
        icon: FileText,
        href: "#front-pages",
      },
      {
        title: "Settings",
        icon: Settings,
        href: "#settings",
      },
    ],
  },
  {
    label: "APPS",
    items: [
      {
        title: "Apps",
        icon: AppWindow,
        href: "#apps",
        children: [
          { title: "To Do List", href: "#todo" },
          { title: "Calendar", href: "#calendar" },
          { title: "Contacts", href: "#contacts" },
          { title: "Email", href: "#email" },
        ],
      },
    ],
  },
  {
    label: "PAGES",
    items: [
      {
        title: "eCommerce",
        icon: ShoppingCart,
        href: "#ecommerce",
        children: [
          { title: "Products", href: "#products" },
          { title: "Orders", href: "#orders" },
          { title: "Customers", href: "#customers" },
        ],
      },
      {
        title: "CRM",
        icon: Briefcase,
        href: "#crm",
        children: [
          { title: "Dashboard", href: "#crm-dashboard" },
          { title: "Leads", href: "#crm-leads" },
          { title: "Deals", href: "#crm-deals" },
        ],
      },
      {
        title: "Project Management",
        icon: KanbanSquare,
        href: "#projects",
        children: [
          { title: "Overview", href: "#projects-overview" },
          { title: "Tasks", href: "#projects-tasks" },
          { title: "Board", href: "#projects-board" },
        ],
      },
    ],
  },
];

const NavBadge = ({ value, hidden }) =>
  value && !hidden ? (
    <Badge
      className={cn(
        "ml-auto rounded-full border border-transparent bg-accent px-2 py-0.5 text-[11px] font-semibold text-foreground"
      )}
    >
      {value}
    </Badge>
  ) : null;

const SimpleLink = ({ item, active, onNavigate, collapsed }) => (
  <Link
    to={item.href}
    onClick={onNavigate}
    className={cn(
      "group relative flex min-h-[44px] items-center gap-3 rounded-xl py-2.5 text-[14px] font-medium transition-colors duration-200 no-underline hover:no-underline",
      collapsed ? "mx-0 justify-center px-0" : "mx-2 pr-4",
      !collapsed && (active ? "pl-8" : "pl-9"),
      active
        ? "bg-muted text-primary"
        : "text-foreground hover:bg-muted",
      active && !collapsed && " border-primary"
    )}
    aria-label={item.title}
    data-active={active || undefined}
  >
    <item.icon
      className={cn(
        "h-5 w-5 flex-shrink-0 transition-colors duration-200",
        active ? "text-primary" : "text-muted-foreground group-hover:text-primary"
      )}
      strokeWidth={1.6}
    />
    {!collapsed && (
      <>
        <span
          className={cn(
            "flex-1 truncate font-medium text-[14px] transition-colors duration-200",
            active ? "text-primary" : "text-foreground group-hover:text-primary"
          )}
        >
          {item.title}
        </span>
        <NavBadge value={item.badge} />
      </>
    )}
  </Link>
);

const SubLink = ({ child, active, onNavigate, collapsed }) => {
  if (collapsed) {
    return null;
  }

  return (
    <Link
      to={child.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2 rounded-md pl-12 pr-4 py-1.5 text-sm font-medium transition-colors duration-200 no-underline hover:no-underline",
        active
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <Dot className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={3} />
      <span className="flex-1 truncate">{child.title}</span>
    </Link>
  );
};

export const Sidebar = ({
  className,
  onNavigate,
  showCloseButton = false,
  onClose,
  collapsed = false,
  variant = "desktop",
}) => {
  const location = useLocation();
  const [openItems, setOpenItems] = useState(new Set());
  const { permissions, hasPermission } = usePermissions();
  const hasUserManagement = hasPermission("usermanagement_access");
  const hasChatAccess = hasPermission("ai_chat_access");

  const navSections = useMemo(() => {
    return NAVIGATION.map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permission) return true;
        if (item.permission === "usermanagement_access") return hasUserManagement;
        if (item.permission === "ai_chat_access") return hasChatAccess;
        return permissions.includes(item.permission);
      }),
    })).filter((section) => section.items.length > 0);
  }, [permissions, hasUserManagement, hasChatAccess]);

  // Initialize open items based on current pathname
  useEffect(() => {
    const newOpenItems = new Set();
    navSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children) {
          const hasActiveChild = item.children.some(
            (child) => location.pathname === child.href
          );
          if (hasActiveChild) {
            newOpenItems.add(item.title);
          }
        }
      });
    });
    setOpenItems(newOpenItems);
  }, [location.pathname, navSections]);

  const toggleAccordion = (itemTitle) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemTitle)) {
        newSet.delete(itemTitle);
      } else {
        newSet.add(itemTitle);
      }
      return newSet;
    });
  };

  const handleNavigate = () => {
    if (typeof onNavigate === "function") {
      onNavigate();
    }
  };

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const isMobileVariant = variant === "mobile";

  return (
    <aside
      data-collapsed={collapsed || undefined}
      className={cn(
        isMobileVariant
          ? "relative flex h-full w-full max-w-[280px] flex-col border-r border-border bg-background shadow-lg"
          : "fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-border bg-background transition-all duration-300 ease-in-out",
        !isMobileVariant && (collapsed ? "lg:w-24" : "lg:w-[288px]"),
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 border-b border-border px-6 py-4",
          collapsed && "flex-col gap-2 px-0 py-4 justify-center"
        )}
      >
        {/* Trezo-style Logo Icon */}
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg
            className="h-5 w-5 text-primary"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="5.5" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="10.5" y="0.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="0.5" y="5.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="5.5" y="5.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="10.5" y="5.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="0.5" y="10.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="5.5" y="10.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
            <rect x="10.5" y="10.5" width="4.5" height="4.5" rx="0.75" fill="currentColor" />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-[18px] font-semibold tracking-tight text-foreground">
            Gromaxx
          </span>
        )}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full border border-border p-1 text-muted-foreground transition hover:text-foreground"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <ScrollArea className={cn("flex-1 px-4", collapsed && "px-1.5")}>
        <div className="space-y-6 pb-6 pt-4">
          {navSections.map((section) => (
            <div key={section.label} className="space-y-3">
              {!collapsed && (
                <p className="mt-6 mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">
                  {section.label}
                </p>
              )}
              <div className="space-y-1.5">
                {section.items.map((item) =>
                  item.children ? (
                    (() => {
                      const hasActiveChild = item.children.some(
                        (child) => location.pathname === child.href
                      );
                      const isExpanded = openItems.has(item.title);
                      const isParentActive = hasActiveChild || isExpanded;

                      return (
                        <div key={item.title} className="space-y-1">
                          <button
                            type="button"
                            onClick={() => toggleAccordion(item.title)}
                            className={cn(
                              "group relative flex w-full min-h-[44px] items-center gap-3 rounded-xl py-2.5 text-left text-[14px] font-medium transition-colors duration-200 no-underline hover:no-underline",
                              collapsed ? "mx-0 justify-center px-0" : "mx-2 pr-4",
                              !collapsed && (isParentActive ? "pl-8" : "pl-9"),
                              isParentActive
                                ? "bg-muted text-primary"
                                : "text-foreground hover:bg-muted",
                              isParentActive &&
                                !collapsed &&
                                " border-primary"
                            )}
                            aria-label={item.title}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                                isParentActive
                                  ? "text-primary"
                                  : "text-muted-foreground group-hover:text-primary"
                              )}
                              strokeWidth={1.6}
                            />
                            {!collapsed && (
                              <>
                                <span
                                  className={cn(
                                    "flex-1 truncate font-medium text-[14px] transition-colors duration-200",
                                    isParentActive
                                      ? "text-primary"
                                      : "text-foreground group-hover:text-primary"
                                  )}
                                >
                                  {item.title}
                                </span>
                                <NavBadge value={item.badge} />
                                <ChevronRight
                                  className={cn(
                                    "ml-auto h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-90"
                                  )}
                                />
                              </>
                            )}
                          </button>
                          {!collapsed && (
                            <div
                              className={cn(
                                "space-y-1 overflow-hidden transition-all duration-300",
                                isExpanded
                                  ? "max-h-[500px] opacity-100"
                                  : "max-h-0 opacity-0"
                              )}
                            >
                              <div className="space-y-1 pt-1">
                                {item.children.map((child) => (
                                  <SubLink
                                    key={child.title}
                                    child={child}
                                    active={location.pathname === child.href}
                                    onNavigate={handleNavigate}
                                    collapsed={collapsed}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <SimpleLink
                      key={item.title}
                      item={item}
                      active={location.pathname === item.href}
                      onNavigate={handleNavigate}
                      collapsed={collapsed}
                    />
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};


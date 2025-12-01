import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/app/constants";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions.js";
import "./Sidebar.css";

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
        icon: MessageSquare,
        href: ROUTES.CHAT,
        permission: "ai_chat_access",
      },
    ],
  },
];

// Navigation Link Component with Tooltip
const NavLink = ({ item, active, onNavigate, collapsed, hasChildren, isExpanded, onToggle, buttonRef }) => {
  const Icon = item.icon;
  const iconRef = useRef(null);
  const tooltipRef = useRef(null);

  const updateTooltipPosition = () => {
    if (iconRef.current && tooltipRef.current) {
      const iconRect = iconRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      
      if (collapsed) {
        // When collapsed, tooltip appears to the right of icon (flex alignment)
        tooltip.style.left = `${iconRect.right + 18}px`;
        tooltip.style.top = `${iconRect.top + iconRect.height / 2}px`;
        tooltip.style.transform = 'translateY(-50%)';
      } else {
        // When expanded, tooltip appears to the right of icon
        tooltip.style.left = `${iconRect.right + 18}px`;
        tooltip.style.top = `${iconRect.top + iconRect.height / 2}px`;
        tooltip.style.transform = 'translateY(-50%)';
      }
    }
  };

  useEffect(() => {
    if (iconRef.current && tooltipRef.current) {
      const icon = iconRef.current;
      const tooltip = tooltipRef.current;
      
      const handleMouseEnter = () => {
        updateTooltipPosition();
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      };
      
      const handleMouseLeave = () => {
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'hidden';
      };

      icon.addEventListener('mouseenter', handleMouseEnter);
      icon.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        icon.removeEventListener('mouseenter', handleMouseEnter);
        icon.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [collapsed]);

  if (hasChildren) {
    return (
      <div className="sidebar-tooltip-container">
        <button
          ref={buttonRef}
          type="button"
          onClick={onToggle}
          className={`sidebar-nav-link ${active ? "active" : ""} ${collapsed ? "collapsed" : ""} ${isExpanded ? "expanded" : ""}`}
          aria-label={item.title}
        >
          <div className="sidebar-icon-wrapper" ref={iconRef}>
            <Icon className="sidebar-nav-icon" />
          </div>
          {!collapsed && (
            <>
              <span className="sidebar-nav-text">{item.title}</span>
              {item.badge && (
                <span className={`sidebar-nav-badge ${item.badgeColor || ""}`}>{item.badge}</span>
              )}
              {isExpanded ? (
                <ChevronUp className="sidebar-chevron" />
              ) : (
                <ChevronDown className="sidebar-chevron" />
              )}
            </>
          )}
        </button>
        <div className="sidebar-tooltip" ref={tooltipRef}>{item.title}</div>
      </div>
    );
  }

  return (
    <div className="sidebar-tooltip-container">
      <Link
        to={item.href}
        onClick={onNavigate}
        className={`sidebar-nav-link ${active ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
        aria-label={item.title}
      >
        <div className="sidebar-icon-wrapper" ref={iconRef}>
          <Icon className="sidebar-nav-icon" />
        </div>
        {!collapsed && (
          <>
            <span className="sidebar-nav-text">{item.title}</span>
            {item.badge && (
              <span className={`sidebar-nav-badge ${item.badgeColor || ""}`}>{item.badge}</span>
            )}
          </>
        )}
      </Link>
      <div className="sidebar-tooltip" ref={tooltipRef}>{item.title}</div>
    </div>
  );
};

// Sub Link Component
const SubLink = ({ child, active, onNavigate, collapsed }) => {
  const Icon = child.icon;
  return (
    <Link
      to={child.href}
      onClick={onNavigate}
      className={`sidebar-sublink ${active ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
    >
      {Icon && (
        <Icon className="sidebar-sublink-icon" />
      )}
      <span className="sidebar-sublink-text">{child.title}</span>
    </Link>
  );
};

// Menu Item Wrapper Component (to use hooks properly)
const MenuItemWrapper = ({ item, location, collapsed, openItems, toggleAccordion, handleNavigate }) => {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = openItems.has(item.title);
  const buttonRef = useRef(null);
  const submenuRef = useRef(null);

  // Position collapsed dropdown
  useEffect(() => {
    if (collapsed && isExpanded && hasChildren && buttonRef.current && submenuRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const submenu = submenuRef.current;
      // Position dropdown below the button with small gap
      submenu.style.top = `${buttonRect.bottom + 4}px`;
      submenu.style.left = `${buttonRect.left}px`;
      submenu.style.width = 'auto';
    }
  }, [collapsed, isExpanded, hasChildren]);

  return (
    <div className="sidebar-item-wrapper">
      <NavLink
        item={item}
        active={location.pathname === item.href}
        onNavigate={handleNavigate}
        collapsed={collapsed}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggle={() => toggleAccordion(item.title)}
        buttonRef={buttonRef}
      />
      {hasChildren && isExpanded && (
        <div 
          ref={submenuRef}
          className={`sidebar-sublinks ${collapsed ? "collapsed" : ""}`}
        >
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
      )}
    </div>
  );
};

export const Sidebar = ({
  className = "",
  onNavigate,
  showCloseButton = false,
  onClose,
  collapsed = false,
  onToggleCollapse,
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

  const sidebarClasses = `enterprise-sidebar ${collapsed ? "collapsed" : "expanded"} ${className}`.trim();

  return (
    <aside
      className={sidebarClasses}
      data-collapsed={collapsed || undefined}
      data-variant={variant}
    >
      {/* Header */}
      <div className={`sidebar-header ${collapsed ? "collapsed" : ""}`}>
        {collapsed ? (
          <div className="sidebar-logo">
            <span className="logo-text">G</span>
          </div>
        ) : (
          <span className="sidebar-title">Gromaxx</span>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="sidebar-toggle-btn"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="sidebar-toggle-icon" />
            ) : (
              <ChevronLeft className="sidebar-toggle-icon" />
            )}
          </button>
        )}
        {showCloseButton && !collapsed && (
          <button
            type="button"
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
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

      {/* Navigation */}
      <div className={`sidebar-scroll ${collapsed ? "collapsed" : ""}`}>
        <div className="sidebar-sections">
          {navSections.map((section) => (
            <div key={section.label} className="sidebar-section">
              {!collapsed && (
                <p className="sidebar-section-label">{section.label}</p>
              )}
              <div className="sidebar-links">
                {section.items.map((item) => (
                  <MenuItemWrapper
                    key={item.title}
                    item={item}
                    location={location}
                    collapsed={collapsed}
                    openItems={openItems}
                    toggleAccordion={toggleAccordion}
                    handleNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};


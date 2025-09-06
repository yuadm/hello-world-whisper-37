
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Shield,
  Settings,
  UserCog,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Briefcase,
  FileSignature,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { usePermissions } from "@/contexts/PermissionsContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    description: "Overview & Analytics",
    requiredPage: "/"
  },
  {
    title: "Employees",
    url: "/employees",
    icon: Users,
    description: "Manage Staff",
    requiredPage: "/employees"
  },
  {
    title: "Clients",
    url: "/clients",
    icon: Building2,
    description: "Manage Clients",
    requiredPage: "/clients"
  },
  {
    title: "Leaves",
    url: "/leaves",
    icon: Calendar,
    description: "Time Off Management",
    requiredPage: "/leaves"
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    description: "Document Tracking",
    requiredPage: "/documents"
  },
  {
    title: "Document Signing",
    url: "/document-signing",
    icon: FileSignature,
    description: "Digital Signatures",
    requiredPage: "/document-signing"
  },
  {
    title: "Compliance",
    url: "/compliance",
    icon: Shield,
    description: "Regulatory Tasks",
    requiredPage: "/compliance"
  },
  {
    title: "Reports",
    url: "/reports",
    icon: BarChart3,
    description: "Analytics & Export",
    requiredPage: "/reports"
  },
  {
    title: "Job Applications",
    url: "/job-applications",
    icon: Briefcase,
    description: "Review Applications",
    requiredPage: "/job-applications"
  },
];

const settingsItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "System Configuration",
    requiredPage: "/settings"
  },
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCog,
    description: "Roles & Permissions",
    requiredPage: "/user-management"
  },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { companySettings } = useCompany();
  const { user, userRole, signOut } = useAuth();
  const { hasPageAccess, loading: permissionsLoading, error } = usePermissions();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return cn(
      "group relative flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300",
      "hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:backdrop-blur-sm",
      "hover:shadow-md hover:scale-[1.02] hover:translate-x-1",
      "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-0 before:bg-gradient-primary before:rounded-full before:transition-all before:duration-300",
      active
        ? "bg-gradient-primary text-primary-foreground shadow-glow-lg before:h-8 translate-x-1"
        : "text-sidebar-foreground hover:text-sidebar-primary hover:before:h-4"
    );
  };

  // Filter navigation items based on permissions (only when not loading)
  const accessibleNavigationItems = permissionsLoading 
    ? [] 
    : navigationItems.filter(item => hasPageAccess(item.requiredPage));

  const accessibleSettingsItems = permissionsLoading 
    ? [] 
    : settingsItems.filter(item => hasPageAccess(item.requiredPage));

  return (
    <Sidebar
      className={cn(
        "border-r border-sidebar-border/50 bg-gradient-to-b from-sidebar/95 to-sidebar/90 backdrop-blur-xl transition-all duration-500",
        "shadow-xl shadow-black/5",
        collapsed ? "w-16" : "w-72"
      )}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border/30 px-6 py-6">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-primary-glow flex items-center justify-center overflow-hidden animate-glow">
                {companySettings.logo ? (
                  <img
                    src={companySettings.logo}
                    alt="Company Logo"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Shield className="w-6 h-6 text-white" />
                )}
                <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-50 blur-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground bg-gradient-primary bg-clip-text text-transparent">
                  {companySettings.name}
                </h1>
                <p className="text-sm text-sidebar-foreground/70 font-medium">
                  {companySettings.tagline}
                </p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "w-10 h-10 p-0 rounded-xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:scale-110 transition-all duration-300",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-sidebar-foreground" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-sidebar-foreground" />
            )}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6">
        {permissionsLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-sidebar-accent rounded w-20"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-sidebar-accent rounded"></div>
              ))}
            </div>
            <div className="animate-pulse space-y-2 mt-8">
              <div className="h-4 bg-sidebar-accent rounded w-24"></div>
              {[1, 2].map((i) => (
                <div key={i} className="h-10 bg-sidebar-accent rounded"></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <div className="text-destructive text-sm mb-2">Failed to load permissions</div>
            <div className="text-xs text-muted-foreground">Please refresh the page</div>
          </div>
        ) : (
          <>
            <SidebarGroup>
              {!collapsed && (
                <SidebarGroupLabel className="text-xs uppercase tracking-widest text-sidebar-foreground/50 font-bold mb-4 px-4">
                  Main Menu
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {accessibleNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                        <NavLink to={item.url} className={getNavClassName(item.url)}>
                          <div className="w-6 h-6 flex items-center justify-center">
                            <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base">{item.title}</div>
                              <div className="text-xs text-sidebar-foreground/60 truncate font-medium">
                                {item.description}
                              </div>
                            </div>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {accessibleSettingsItems.length > 0 && (
              <SidebarGroup className="mt-10">
                {!collapsed && (
                  <SidebarGroupLabel className="text-xs uppercase tracking-widest text-sidebar-foreground/50 font-bold mb-4 px-4">
                    Administration
                  </SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2">
                    {accessibleSettingsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild tooltip={collapsed ? item.title : undefined}>
                          <NavLink to={item.url} className={getNavClassName(item.url)}>
                            <div className="w-6 h-6 flex items-center justify-center">
                              <item.icon className="w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            {!collapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-base">{item.title}</div>
                                <div className="text-xs text-sidebar-foreground/60 truncate font-medium">
                                  {item.description}
                                </div>
                              </div>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/30 px-4 py-4 space-y-3">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-sidebar-accent/30 to-sidebar-accent/10 border border-sidebar-border/20">
              <div className="relative w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-50 blur-lg animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-sidebar-foreground">
                  {user?.email || 'Unknown User'}
                </div>
                <div className="text-xs text-sidebar-foreground/60 capitalize font-medium">
                  {userRole || 'user'}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-4 px-4 py-3 text-sidebar-foreground hover:text-destructive hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">Sign Out</span>
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <div className="relative w-10 h-10 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-50 blur-lg animate-pulse" />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="w-10 h-10 mx-auto p-0 hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 hover:text-destructive rounded-xl transition-all duration-300 hover:scale-110"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

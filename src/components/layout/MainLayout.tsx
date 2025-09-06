import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-gradient-mesh">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Enhanced Top Header */}
          <header className="sticky top-0 z-40 glass-strong border-b border-border/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <SidebarTrigger className="lg:hidden rounded-xl hover:bg-primary/10 transition-all duration-300 hover:scale-110" />
              </div>

              <div className="flex items-center gap-4">
                {/* Enhanced Notifications */}
                <Button variant="ghost" size="sm" className="relative w-12 h-12 rounded-2xl hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all duration-300 hover:scale-110 group">
                  <Bell className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-destructive to-destructive/80 rounded-full animate-pulse shadow-lg shadow-destructive/50"></span>
                </Button>

                {/* Enhanced Profile */}
                <div className="relative">
                  <ProfileDropdown />
                </div>
              </div>
            </div>
          </header>

          {/* Enhanced Main Content */}
          <main className="flex-1 p-8 overflow-auto">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
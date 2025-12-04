import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, FolderOpen, PlusCircle, BarChart3, 
  FileText, Settings, LogOut, Menu, X, Shield, 
  Bell, User, ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { canPerformAction, ROLE_DESCRIPTIONS } from "@/components/auth/RolePermissions";
import NotificationCenter from "@/components/notifications/NotificationCenter";

const navItems = [
  { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard, permission: null },
  { name: 'Cases', page: 'Cases', icon: FolderOpen, permission: null },
  { name: 'New Case', page: 'NewCase', icon: PlusCircle, permission: 'canCreateCase' },
  { name: 'Analytics', page: 'Analytics', icon: BarChart3, permission: null },
  { name: 'Reports', page: 'Reports', icon: FileText, permission: 'canGenerateReports' },
  { name: 'My Profile', page: 'Profile', icon: User, permission: null },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      // Redirect new users to setup profile if they don't have a role
      if (!userData.saps_role && currentPageName !== 'SetupProfile') {
        window.location.href = createPageUrl("SetupProfile");
      }
    }).catch(() => {});
  }, [currentPageName]);

  // Show minimal layout for setup page
  if (currentPageName === 'SetupProfile') {
    return <>{children}</>;
  }

  const handleLogout = () => {
    base44.auth.logout();
  };

  const userRole = user?.saps_role || 'Constable';
  const roleInfo = ROLE_DESCRIPTIONS[userRole] || ROLE_DESCRIPTIONS['Constable'];

  // Filter nav items based on permissions
  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true;
    return canPerformAction(userRole, item.permission);
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar - SAPS Colors */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#003366] border-b border-[#002244]">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[#002244] text-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3">
                            <img 
                              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/692c9a024c70ddd2c34f85a1/447bd5b1e_eDocket_logo_option_B_v11.png" 
                              alt="eDocket Logo" 
                              className="h-10 w-10 object-contain"
                            />
                            <div className="hidden sm:block">
                              <h1 className="text-lg font-bold text-white">eDocket</h1>
                              <p className="text-xs text-[#FFD700] -mt-0.5">Crime Analytics Platform</p>
                            </div>
                          </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <NotificationCenter />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 pl-2 pr-3 text-white hover:bg-[#002244]">
                  <div className="h-8 w-8 rounded-full bg-[#FFD700] flex items-center justify-center">
                    <User className="h-4 w-4 text-[#003366]" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white leading-none">
                      {user?.full_name || 'Officer'}
                    </p>
                    <p className="text-xs text-[#FFD700] mt-0.5">
                      {userRole}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <span>{user?.full_name || 'Officer'}</span>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", roleInfo.color)}>
                      {userRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-normal mt-1">{roleInfo.description}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link to={createPageUrl("Profile")}>
                                        <DropdownMenuItem>
                                          <User className="h-4 w-4 mr-2" />
                                          Profile
                                        </DropdownMenuItem>
                                      </Link>
                                      <Link to={createPageUrl("Settings")}>
                                        <DropdownMenuItem>
                                          <Settings className="h-4 w-4 mr-2" />
                                          Settings
                                        </DropdownMenuItem>
                                      </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sidebar - SAPS Colors */}
      <aside className={cn(
        "fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Role Badge */}
        <div className="p-4 border-b border-slate-100">
          <div className={cn("px-3 py-2 rounded-lg text-center", roleInfo.color)}>
            <p className="text-xs font-medium">{roleInfo.title}</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = currentPageName === item.page;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive 
                    ? "bg-[#003366] text-white shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isActive ? "text-[#FFD700]" : "text-slate-400"
                )} />
                {item.name}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#FFD700]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#003366] to-[#002244]">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-lg bg-[#FFD700] flex items-center justify-center">
                <Shield className="h-5 w-5 text-[#003366]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Need Help?</p>
                <p className="text-xs text-slate-300">Contact IT support</p>
              </div>
            </div>
            <Link to={createPageUrl("ITSupport")} className="w-full">
                                <Button variant="secondary" size="sm" className="w-full bg-white/10 text-white hover:bg-white/20 border-0">
                                  Get Support
                                </Button>
                              </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
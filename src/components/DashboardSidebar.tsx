import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardList,
  BarChart3, Bell, LogOut, ChevronLeft, ChevronRight, UserPlus, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { role, signOut, user } = useAuth();

  const adminLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/teachers', icon: Users, label: 'Teachers' },
    { to: '/dashboard/students', icon: GraduationCap, label: 'Students' },
    { to: '/dashboard/classes', icon: BookOpen, label: 'Classes' },
    { to: '/dashboard/subjects', icon: ClipboardList, label: 'Subjects' },
    { to: '/dashboard/create-user', icon: UserPlus, label: 'Create User' },
    { to: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
  ];

  const teacherLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/my-classes', icon: BookOpen, label: 'My Classes' },
    { to: '/dashboard/marks', icon: BarChart3, label: 'Marks' },
    { to: '/dashboard/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
  ];

  const studentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/my-marks', icon: BarChart3, label: 'My Marks' },
    { to: '/dashboard/my-attendance', icon: Calendar, label: 'My Attendance' },
    { to: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  return (
    <aside className={cn(
      "sidebar-nav min-h-screen flex flex-col transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">EduManager</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        {!collapsed && (
          <div className="mb-3 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || user?.email}
            </p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{role}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={signOut}
          className={cn(
            "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full",
            collapsed ? "justify-center px-0" : "justify-start"
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

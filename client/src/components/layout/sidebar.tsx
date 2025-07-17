import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  Home,
  Map,
  Users,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  UserCheck,
  Menu,
  X,
  Book,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";

interface MenuItem {
  id: string;
  title: string;
  type: "item" | "group";
  icon?: string;
  url?: string;
  children?: MenuItem[];
}

const menuItems: { items: MenuItem[] } = {
  items: [
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      icon: "feather icon-bar-chart",
      url: "/dashboard",
    },
    {
      id: "masters",
      title: "Masters",
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "roles",
          title: "Roles",
          type: "item",
          icon: "feather icon-shield",
          url: "/roles",
        },
        {
          id: "subjects",
          title: "Subjects",
          type: "item",
          icon: "feather icon-book",
          url: "/subjects",
        },
        {
          id: "staff-data",
          title: "Staff Data",
          type: "item",
          icon: "feather icon-users",
          url: "/staff",
        },
        {
          id: "class-mapping",
          title: "Class/Subject/Div Mapping",
          type: "item",
          icon: "feather icon-graduation-cap",
          url: "/class-mapping",
        },
        {
          id: "syllabus-master",
          title: "Syllabus Master",
          type: "item",
          icon: "feather icon-file-text",
          url: "/syllabus-master",
        },
        {
          id: "periodic-test",
          title: "Schedule Periodic Test",
          type: "item",
          icon: "feather icon-clock",
          url: "/periodic-test",
        },
        {
          id: "teacher-mapping",
          title: "Teacher Subject/Class/Div Mapping",
          type: "item",
          icon: "feather icon-user-check",
          url: "/teacher-mapping",
        },
        {
          id: "student-masters",
          title: "Student Masters",
          type: "item",
          icon: "feather icon-book-open",
          url: "/student-masters",
        },
        {
          id: "working-days",
          title: "Working Days",
          type: "item",
          icon: "feather icon-calendar",
          url: "/working-days",
        },
        {
          id: "school-schedule",
          title: "School Schedule",
          type: "item",
          icon: "feather icon-clock",
          url: "/school-schedule",
        },
        {
          id: "time-table",
          title: "Create Time Table",
          type: "item",
          icon: "feather icon-calendar",
          url: "/time-table",
        },
      ],
    },
    {
      id: "others",
      title: "Others",
      type: "group",
      icon: "icon-settings",
      children: [
        {
          id: "public-holidays",
          title: "Public Holiday/Vacation Master",
          type: "item",
          icon: "feather icon-calendar",
          url: "/public-holidays",
        },
        {
          id: "hand-book",
          title: "Hand Book",
          type: "item",
          icon: "feather icon-file-text",
          url: "/hand-book",
        },
        {
          id: "newsletter",
          title: "Newsletter",
          type: "item",
          icon: "feather icon-file-text",
          url: "/newsletter",
        },
        {
          id: "bus-routes",
          title: "Bus Routes",
          type: "item",
          icon: "feather icon-navigation",
          url: "/bus-routes",
        },
        {
          id: "events",
          title: "Events",
          type: "item",
          icon: "feather icon-calendar",
          url: "/events",
        },
        {
          id: "news-circulars",
          title: "Flash News / School News / Circular Screen",
          type: "item",
          icon: "feather icon-bell",
          url: "/news-circulars",
        },
      ],
    },
  ],
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "feather icon-bar-chart":
      return BarChart3;
    case "feather icon-home":
      return Home;
    case "feather icon-map":
      return Map;
    case "feather icon-users":
      return Users;
    case "feather icon-graduation-cap":
      return GraduationCap;
    case "feather icon-user-check":
      return UserCheck;
    case "feather icon-book":
      return Book;
    case "feather icon-calendar":
      return Calendar;
    case "feather icon-clock":
      return Clock;
    case "feather icon-file-text":
      return FileText;
    default:
      return Home;
  }
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "institution",
  ]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    if (item.type === "group") {
      const isExpanded = expandedGroups.includes(item.id);
      return (
        <div key={item.id} className="mb-2">
          <Button
            variant="ghost"
            className="w-full justify-between p-3 w-100 h-auto text-sm font-medium text-white/90 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/5 rounded-xl transition-all duration-200"
            onClick={() => toggleGroup(item.id)}
          >
            <span>{item.title}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
          {isExpanded && item.children && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map(renderMenuItem)}
            </div>
          )}
        </div>
      );
    }

    if (item.type === "item" && item.url) {
      const Icon = getIcon(item.icon || "");
      const isActive = location === item.url;

      return (
        <Link key={item.id} href={item.url}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start p-3 h-auto text-sm font-normal text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/5 mb-1",
              isActive &&
                "bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border-white/20 shadow-lg hover:from-blue-500/40 hover:to-purple-500/40",
            )}
            onClick={onClose}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      );
    }

    return null;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 border-r border-purple-500/20 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 backdrop-blur-xl flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          boxShadow:
            "4px 0 20px -2px rgba(0, 0, 0, 0.3), 2px 0 10px -1px rgba(0, 0, 0, 0.2)",
        }}
      >
        <div className="flex items-center justify-between p-4 h-16 border-b border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg flex items-center justify-center shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              EduAdmin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white/80 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full p-4">
            <nav className="space-y-2">{menuItems.items.map(renderMenuItem)}</nav>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

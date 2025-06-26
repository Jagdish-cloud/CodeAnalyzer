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
  Menu,
  X,
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
      id: "institution",
      title: "Institution",
      type: "group",
      icon: "icon-navigation",
      children: [
        {
          id: "dashboard",
          title: "Dashboard",
          type: "item",
          icon: "feather icon-bar-chart",
          url: "/dashboard",
        },
        {
          id: "create-institution",
          title: "Institution",
          type: "item",
          icon: "feather icon-home",
          url: "/",
        },
        {
          id: "staff-data",
          title: "Staff Data",
          type: "item",
          icon: "feather icon-users",
          url: "/staff",
        },
        {
          id: "create-mapping",
          title: "Map Institution to Modules",
          type: "item",
          icon: "feather icon-map",
          url: "/mapping",
        },
        {
          id: "class-mapping",
          title: "Class/Subject/Div Mapping",
          type: "item",
          icon: "feather icon-graduation-cap",
          url: "/class-mapping",
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
            className="w-full justify-between p-2 h-auto text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-300"
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
              "w-full justify-start p-2 h-auto text-sm font-normal text-slate-700 hover:bg-slate-300 hover:text-slate-900",
              isActive && "bg-blue-100 text-blue-800 border-r-2 border-blue-600 hover:bg-blue-100"
            )}
            onClick={onClose}
          >
            <Icon className="h-4 w-4 mr-3" />
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
          "fixed left-0 top-0 h-full w-64 bg-slate-200 border-r border-slate-300 shadow-lg z-50 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{ boxShadow: "4px 0 6px -1px rgba(0, 0, 0, 0.1), 2px 0 4px -1px rgba(0, 0, 0, 0.06)" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-300">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-7 text-slate-700" />
            <span className="font-semibold text-slate-800">School Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">{menuItems.items.map(renderMenuItem)}</nav>
        </ScrollArea>
      </div>
    </>
  );
}

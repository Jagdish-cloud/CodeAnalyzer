import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Bell, 
  User, 
  Search,
  Settings,
  LogOut,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface NavbarProps {
  onMenuToggle: () => void;
  sidebarOpen: boolean;
  onSidebarClose: () => void;
}

export function Navbar({ onMenuToggle, sidebarOpen, onSidebarClose }: NavbarProps) {
  return (
    <header className="bg-gradient-to-r from-white/95 via-blue-50/95 to-purple-50/95 dark:from-slate-900/95 dark:via-indigo-900/95 dark:to-purple-900/95 backdrop-blur-xl border-b border-white/20 dark:border-purple-500/20 h-16 flex items-center justify-between px-4 lg:px-6 shadow-lg">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-slate-700 dark:text-white/90 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl"
          onClick={sidebarOpen ? onSidebarClose : onMenuToggle}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* Search */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
            <Input
              placeholder="Search across all modules..."
              className="pl-10 w-80 bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/40 backdrop-blur-sm rounded-xl focus:bg-white dark:focus:bg-slate-800 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative text-slate-700 dark:text-white/90 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg animate-pulse">
            3
          </span>
        </Button>

        {/* Quick Actions */}
        <Button variant="ghost" size="sm" className="text-slate-700 dark:text-white/90 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-200">
          <Settings className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center space-x-3 text-slate-700 dark:text-white/90 hover:bg-white/20 dark:hover:bg-white/10 rounded-xl transition-all duration-200 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">Admin User</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-white/20 dark:border-slate-700/20 shadow-2xl" align="end">
            <DropdownMenuLabel className="text-slate-800 dark:text-slate-200">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
            <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg mx-1">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg mx-1">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-200/50 dark:bg-slate-700/50" />
            <DropdownMenuItem className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg mx-1">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
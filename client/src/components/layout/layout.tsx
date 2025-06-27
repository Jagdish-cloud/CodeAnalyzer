import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Navbar } from "./navbar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area */}
      <div className="lg:ml-80 transition-all duration-300">
        <Navbar 
          onMenuToggle={toggleSidebar} 
          sidebarOpen={sidebarOpen}
          onSidebarClose={closeSidebar}
        />
        
        {/* Page content */}
        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
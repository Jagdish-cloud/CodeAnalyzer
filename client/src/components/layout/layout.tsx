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
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main content area */}
      <div className="lg:ml-64">
        <Navbar 
          onMenuToggle={toggleSidebar} 
          sidebarOpen={sidebarOpen}
          onSidebarClose={closeSidebar}
        />
        
        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
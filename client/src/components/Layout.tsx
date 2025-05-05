import { useState } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar className="hidden md:flex md:w-64 flex-col glass shadow-lg z-30" />

      {/* Mobile Sidebar - Shown when menu is open */}
      {mobileMenuOpen && (
        <div className="absolute inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <Sidebar className="w-64 h-full glass shadow-lg z-50" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background relative flex flex-col">
        {/* Mobile Header */}
        <MobileHeader onToggleMenu={toggleMobileMenu} />

        {/* Page Content */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* Footer */}
        <footer className="py-4 text-center text-primary/80 font-medium font-space border-t border-primary/10">
          Desenvolvido por João Vitor Belasque &copy; 2025
        </footer>
      </div>
    </div>
  );
};

export default Layout;

import { Menu } from "lucide-react";

interface MobileHeaderProps {
  onToggleMenu: () => void;
}

const MobileHeader = ({ onToggleMenu }: MobileHeaderProps) => {
  return (
    <header className="md:hidden glass sticky top-0 z-20 border-b border-primary/20 flex items-center justify-between px-4 py-3">
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center mr-2">
          <span className="text-primary text-lg font-bold font-space">S</span>
        </div>
        <h1 className="text-lg font-bold font-space text-foreground">StudyMind</h1>
      </div>
      <button 
        className="p-2 rounded-lg hover:bg-primary/10" 
        onClick={onToggleMenu}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6 text-foreground" />
      </button>
    </header>
  );
};

export default MobileHeader;

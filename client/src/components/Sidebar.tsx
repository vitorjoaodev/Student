import { useLocation, Link } from "wouter";
import { useUser } from "../contexts/UserContext";
import {
  Home,
  CheckSquare,
  Calendar,
  TrendingUp,
  Timer,
  Zap
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className = "" }: SidebarProps) => {
  const [location] = useLocation();
  const { user } = useUser();

  return (
    <aside className={className}>
      <div className="p-4 flex items-center border-b border-primary/20">
        <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center mr-3">
          <span className="text-primary text-xl font-bold font-space">S</span>
        </div>
        <h1 className="text-xl font-bold font-space text-foreground">StudyMind</h1>
      </div>
      
      <div className="py-4 flex-1 overflow-y-auto scrollbar-thin">
        <nav className="px-4 space-y-1">
          <Link href="/">
            <a className={`sidebar-link ${location === "/" ? "active" : ""}`}>
              <Home className="h-5 w-5 mr-3" />
              Dashboard
            </a>
          </Link>
          <Link href="/tasks">
            <a className={`sidebar-link ${location === "/tasks" ? "active" : ""}`}>
              <CheckSquare className="h-5 w-5 mr-3" />
              Tasks
            </a>
          </Link>
          <Link href="/mindmap">
            <a className={`sidebar-link ${location === "/mindmap" ? "active" : ""}`}>
              <Zap className="h-5 w-5 mr-3" />
              Mind Map
            </a>
          </Link>
          <Link href="/calendar">
            <a className={`sidebar-link ${location === "/calendar" ? "active" : ""}`}>
              <Calendar className="h-5 w-5 mr-3" />
              Calendar
            </a>
          </Link>
          <Link href="/goals">
            <a className={`sidebar-link ${location === "/goals" ? "active" : ""}`}>
              <TrendingUp className="h-5 w-5 mr-3" />
              Goals
            </a>
          </Link>
          <Link href="/pomodoro">
            <a className={`sidebar-link ${location === "/pomodoro" ? "active" : ""}`}>
              <Timer className="h-5 w-5 mr-3" />
              Pomodoro
            </a>
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-primary/20">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-secondary/30 flex items-center justify-center">
            <span className="text-secondary text-sm font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-foreground/50">{user?.university}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

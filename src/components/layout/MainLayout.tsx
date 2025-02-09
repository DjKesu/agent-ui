import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  Home,
  Box,
  GitBranch,
  Database,
  Wrench,
  Brain,
  Settings,
  Library,
  Network,
  Layers,
  Store,
  LayoutDashboard
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li>
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
          isActive 
            ? "bg-primary/15 text-primary font-medium shadow-sm shadow-primary/20 border border-primary/20"
            : "text-foreground/60 hover:text-foreground hover:bg-white/[0.03]"
        )}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-foreground/60"
          )
        })}
        {label}
      </Link>
    </li>
  );
};

const NavSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="mb-3 px-3 text-xs font-semibold tracking-wider text-foreground/40 uppercase">{title}</h2>
    <ul className="space-y-1">
      {children}
    </ul>
  </div>
);

const MainLayout: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-vanilla/30 via-tea-green/20 to-atomic-tangerine/10 pointer-events-none" />

      <div className="flex relative">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 z-40 h-screen w-64">
          <div className="glass h-full flex flex-col px-3 py-4">
            <div className="mb-6 px-3">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">
                Agent UI
              </h1>
            </div>
            
            <nav className="flex-1 space-y-6 overflow-y-auto">
              <NavSection title="General">
                <NavItem to="/" icon={<Home size={20} />} label="Home" />
                <NavItem to="/store" icon={<Store size={20} />} label="Plugin Store" />
                <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                <NavItem to="/workflows" icon={<GitBranch size={20} />} label="Workflows" />
              </NavSection>

              <NavSection title="Agent Components">
                <NavItem to="/tools" icon={<Wrench size={20} />} label="Tools" />
                <NavItem to="/skills" icon={<Brain size={20} />} label="Skills" />
                <NavItem to="/functions" icon={<Box size={20} />} label="Functions" />
              </NavSection>

              <NavSection title="Knowledge & Data">
                <NavItem to="/datastores" icon={<Database size={20} />} label="Data Stores" />
                <NavItem to="/knowledge-bases" icon={<Library size={20} />} label="Knowledge Bases" />
              </NavSection>

              <NavSection title="Integrations">
                <NavItem to="/frameworks" icon={<Layers size={20} />} label="LLM Frameworks" />
                <NavItem to="/models" icon={<Network size={20} />} label="Models" />
              </NavSection>
            </nav>

            <div className="border-t border-border/10 pt-4">
              <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className={cn(
          "flex-1 ml-64 p-6 relative",
          className
        )}>
          <div className="min-h-[calc(100vh-3rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 
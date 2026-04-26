import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Search, ArrowLeft, CalendarDays, BookOpen, Clock, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showMenu?: boolean;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  showBack, 
  onBack, 
  showMenu = true, 
  showSearch = true 
}) => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 h-16 bg-background/80 backdrop-blur-md border-b border-outline/30 shadow-sm">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={onBack || (() => navigate(-1))}
            className="p-2 hover:bg-surface-container rounded-full transition-colors active:opacity-70"
          >
            <ArrowLeft className="w-6 h-6 text-on-surface" />
          </button>
        ) : showMenu ? (
          <button 
           onClick={() => navigate('/settings')}
           className="p-2 hover:bg-surface-container rounded-full transition-colors active:opacity-70 text-on-surface"
          >
            <Menu className="w-6 h-6" />
          </button>
        ) : null}
        <h1 className="font-bold text-lg tracking-tight text-on-surface truncate max-w-[200px] uppercase italic">
          {title}
        </h1>
      </div>
      <div className="flex items-center">
        {showSearch && (
          <button 
             onClick={() => navigate('/topics')}
             className="p-2 hover:bg-surface-container rounded-full transition-colors active:opacity-70 text-primary"
          >
            <Search className="w-6 h-6" />
          </button>
        )}
      </div>
    </header>
  );
};

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Today', icon: Clock, path: '/today' },
    { label: 'Upcoming', icon: CalendarDays, path: '/upcoming' },
    { label: 'Growth', icon: LayoutGrid, path: '/calendar' },
    { label: 'Topics', icon: BookOpen, path: '/topics' },
  ];

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 flex justify-around items-center px-2 py-4 pb-safe bg-surface/90 backdrop-blur-md border border-outline/50 rounded-3xl shadow-xl">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 active:scale-90",
              isActive 
                ? "bg-primary text-white" 
                : "text-zinc-600 hover:text-white"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
            <span className="text-[9px] font-black mt-1 uppercase tracking-widest">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

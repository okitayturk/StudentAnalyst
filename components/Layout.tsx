import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calculator, PlusCircle, BarChart2, BookOpen, School, PenTool } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50';
  };

  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/students', icon: <Users size={20} />, label: 'Öğrenciler' },
    { path: '/exam-entry', icon: <PlusCircle size={20} />, label: 'Deneme Gir' },
    { path: '/question-tracking', icon: <PenTool size={20} />, label: 'Soru Takibi' },
    { path: '/calculators', icon: <Calculator size={20} />, label: 'Puan Hesaplama' },
    { path: '/high-school-scores', icon: <School size={20} />, label: 'Lise Puanları' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <BarChart2 />
            Analiz Sistemi
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive(item.path)}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">v1.1.0 &copy; 2024</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
            {children}
        </div>
      </main>

      {/* Mobile Nav (Bottom) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-50">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path} className={`p-2 rounded-full ${location.pathname === item.path ? 'text-indigo-600' : 'text-slate-400'}`}>
                {item.icon}
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Layout;
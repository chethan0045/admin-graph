import { useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, Home as HomeIcon, LogOut, Menu, Package, Users, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Home from './Home';
import Graphs from './Graphs';
import Placeholder from './Placeholder';

export const SHELL_BASE = '/super-admin';

const NAVIGATION = [
  { name: 'Dashboard', path: '', icon: HomeIcon, exact: true },
  { name: 'Customer Management', path: '/customers', icon: Users },
  { name: 'Package Builder', path: '/package-builder', icon: Package },
  { name: 'Admin Graphs', path: '/admin-graphs', icon: BarChart3 }
];

const SuperAdminShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, signOut } = useAuth();
  const initial = (auth?.email || 'S').charAt(0).toUpperCase();
  const handleLogout = () => { signOut(); navigate(SHELL_BASE); };
  const relative = location.pathname.slice(SHELL_BASE.length) || '/';
  const isCurrent = (item: typeof NAVIGATION[number]) => (item.exact ? relative === '/' : relative.startsWith(item.path));

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="bg-primary text-primary-foreground shadow-sm border-b border-border shrink-0 z-40">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3 lg:gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden text-primary-foreground hover:bg-primary-foreground/20 p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-foreground/20 rounded-lg flex items-center justify-center border border-primary-foreground/30">
                <span className="font-bold text-sm lg:text-lg">S</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-base lg:text-lg font-semibold leading-tight">SimplifyQA</p>
                <p className="text-xs lg:text-sm text-primary-foreground/90 font-medium">License Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3 rounded-lg border border-primary-foreground/30 bg-primary-foreground/10 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/25 flex items-center justify-center text-sm font-semibold">{initial}</div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{auth ? (auth.mode === 'super-admin' ? 'Super admin' : 'User') : 'Not signed in'}</p>
                <p className="text-xs text-primary-foreground/80">{auth?.email || 'Sign in from Admin Graphs'}</p>
              </div>
            </div>
            {auth && (
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={cn('fixed lg:static inset-y-0 left-0 z-30 w-64 lg:w-72 bg-card border-r border-border shrink-0 flex flex-col transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
          <nav className="p-4 lg:p-6 space-y-2 mt-16 lg:mt-4 flex-1">
            {NAVIGATION.map((item) => {
              const current = isCurrent(item);
              return (
                <Button
                  key={item.name}
                  variant={current ? 'default' : 'ghost'}
                  className={cn('w-full justify-start gap-3 px-4 py-3 text-sm lg:text-base font-medium', current ? 'bg-primary text-primary-foreground' : 'text-card-foreground hover:bg-muted')}
                  onClick={() => { navigate(`${SHELL_BASE}${item.path}`); setSidebarOpen(false); }}
                >
                  <item.icon className={cn('w-4 h-4 lg:w-5 lg:h-5', current ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  {item.name}
                </Button>
              );
            })}
          </nav>
          <div className="p-4 lg:p-6 border-t border-border text-center">
            <p className="text-xs text-card-foreground font-medium">SimplifyQA</p>
            <p className="text-xs text-muted-foreground">v2.0.0</p>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/customers" element={<Placeholder kind="customers" />} />
            <Route path="/package-builder" element={<Placeholder kind="packages" />} />
            <Route path="/admin-graphs" element={<Graphs />} />
          </Routes>
        </main>
      </div>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/25 z-20" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default SuperAdminShell;

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LiveAdminGraphs, apiHost } from '@/components/LiveAdminGraphs';

const AdminGraphs = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-foreground/20 rounded-lg flex items-center justify-center border border-primary-foreground/30">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Admin Graphs</h1>
              {apiHost && <p className="text-xs opacity-80">{apiHost}</p>}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <LiveAdminGraphs />
      </main>
    </div>
  );
};

export default AdminGraphs;

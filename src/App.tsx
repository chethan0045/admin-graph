import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import AdminGraphs from '@/pages/AdminGraphs';
import SuperAdminShell from '@/pages/prototype/SuperAdminShell';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } }
});

function RequireAuth({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  return auth ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { auth } = useAuth();
  return auth ? <Navigate to="/" replace /> : <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/" element={<RequireAuth><AdminGraphs /></RequireAuth>} />
            <Route path="/prototype/*" element={<SuperAdminShell />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

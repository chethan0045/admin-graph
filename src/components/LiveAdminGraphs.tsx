import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Building2, LogIn } from 'lucide-react';
import { ApiError, customerName, listCustomers } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { AdminGraphsGrid } from '@/components/AdminGraphsGrid';
import { AdminGraphPayload, useAdminGraph } from '@/hooks/useAdminGraph';
import type { GraphRequest } from '@/graphs/types';
import type { Project } from '@/types/adminGraphs';
import { DEMO_CUSTOMERS } from '@/data/demoGraphs';

export const apiHost = (() => {
  try {
    return new URL(import.meta.env.VITE_API_TARGET || '').host;
  } catch {
    return '';
  }
})();

const Notice = ({ text, tone = 'muted' }: { text: string; tone?: 'muted' | 'error' }) => (
  <Card className="bg-card border border-border shadow-sm">
    <CardContent className={`p-10 text-center text-sm ${tone === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{text}</CardContent>
  </Card>
);

function SignInPrompt() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Sign in to load administration graphs from {apiHost || 'the configured environment'}.</p>
        <Button onClick={() => navigate(`/login?next=${encodeURIComponent(location.pathname)}`)}>
          <LogIn className="w-4 h-4 mr-2" />Sign in
        </Button>
      </CardContent>
    </Card>
  );
}

function SignedInGraphs() {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, signOut, setActiveCustomer } = useAuth();
  const isSuperAdmin = auth?.mode === 'super-admin';
  const isDemo = !!auth?.demo;
  const customersQuery = useQuery({
    queryKey: ['lm-customers', auth?.token],
    queryFn: () => listCustomers(auth?.token as string),
    enabled: isSuperAdmin && !isDemo && !!auth?.token
  });
  const customers = useMemo(
    () => (isDemo
      ? DEMO_CUSTOMERS.map((customer) => ({ id: customer.id, name: customer.name }))
      : isSuperAdmin
      ? (customersQuery.data || []).map((customer) => ({ id: Number(customer.id), name: customerName(customer) })).filter((customer) => Number.isFinite(customer.id))
      : (auth?.sessions || []).map((session) => ({ id: session.customerId, name: session.name }))),
    [isSuperAdmin, isDemo, customersQuery.data, auth?.sessions]
  );
  const customerId = auth?.activeCustomerId ?? null;
  const token = isSuperAdmin ? auth?.token ?? null : auth?.sessions.find((session) => session.customerId === customerId)?.token ?? null;
  const withCustomer = (payload: AdminGraphPayload): AdminGraphPayload | null =>
    (isSuperAdmin ? (customerId ? { customerId, ...payload } : null) : payload);

  useEffect(() => {
    if (customers.length && !customers.some((customer) => customer.id === customerId)) setActiveCustomer(customers[0].id);
  }, [customers, customerId]);

  const projectsQuery = useAdminGraph<Project[]>('all-customer-projects', withCustomer({}), token);
  const projects = useMemo(() => (projectsQuery.data || []).filter((project) => typeof project.id === 'number'), [projectsQuery.data]);

  useEffect(() => {
    const error = projectsQuery.error || customersQuery.error;
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      signOut();
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [projectsQuery.error, customersQuery.error]);

  const request = useMemo<GraphRequest>(() => {
    const base = projects.length ? withCustomer({ projectIds: projects.map((project) => project.id), filters: {} }) : null;
    return {
      token,
      projects,
      base,
      scoped: (projectId) => (base && projectId ? { ...base, filters: { selectedProjectId: projectId } } : base)
    };
  }, [projects, token, isSuperAdmin, customerId]);

  let body: JSX.Element;
  if (isSuperAdmin && customersQuery.isError) body = <Notice tone="error" text={`Could not load customers: ${customersQuery.error.message}`} />;
  else if (isSuperAdmin && customersQuery.isLoading) body = <Notice text="Loading customers…" />;
  else if (isSuperAdmin && customers.length === 0) body = <Notice text="No customers found for this environment." />;
  else if (projectsQuery.isError) body = <Notice tone="error" text={`Could not load projects: ${projectsQuery.error.message}`} />;
  else if (projectsQuery.isLoading) body = <Notice text="Loading projects…" />;
  else if (projects.length === 0) body = <Notice text="This account has no projects yet." />;
  else body = <AdminGraphsGrid request={request} />;

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Admin Graphs</h1>
              {isDemo && <Badge variant="secondary">Dummy data</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">Administration metrics for the selected customer{apiHost ? ` on ${apiHost}` : ''}</p>
          </div>
        </div>
        {customers.length > 0 && (
          <Select value={customerId ? String(customerId) : undefined} onValueChange={(selected) => setActiveCustomer(Number(selected))}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {body}
    </>
  );
}

export function LiveAdminGraphs() {
  const { auth } = useAuth();
  return auth ? <SignedInGraphs /> : <SignInPrompt />;
}

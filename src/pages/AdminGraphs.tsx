import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Building2, LogOut } from 'lucide-react';
import { ApiError, customerName, listCustomers } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { AdminGraphsGrid } from '@/components/AdminGraphsGrid';
import { AdminGraphPayload, useAdminGraph } from '@/hooks/useAdminGraph';
import type { AutoLogging, CountRow, FeatureUsage, GraphData, LastExecution, Project, RoleRow, Team, UserCountByProject, UserLogin, UsersByType } from '@/types/adminGraphs';

const apiHost = (() => {
  try {
    return new URL(import.meta.env.VITE_API_TARGET || '').host;
  } catch {
    return '';
  }
})();

const toGraph = <T,>(query: UseQueryResult<T>): GraphData<T> => ({ data: query.data, isLoading: query.isLoading, error: query.error?.message });

const Notice = ({ text, tone = 'muted' }: { text: string; tone?: 'muted' | 'error' }) => (
  <Card className="bg-card border border-border shadow-sm">
    <CardContent className={`p-10 text-center text-sm ${tone === 'error' ? 'text-destructive' : 'text-muted-foreground'}`}>{text}</CardContent>
  </Card>
);

const AdminGraphs = () => {
  const navigate = useNavigate();
  const { auth, signOut, setActiveCustomer } = useAuth();
  const isSuperAdmin = auth?.mode === 'super-admin';
  const customersQuery = useQuery({
    queryKey: ['lm-customers', auth?.token],
    queryFn: () => listCustomers(auth?.token as string),
    enabled: isSuperAdmin && !!auth?.token
  });
  const customers = useMemo(
    () => (isSuperAdmin
      ? (customersQuery.data || []).map((customer) => ({ id: Number(customer.id), name: customerName(customer) })).filter((customer) => Number.isFinite(customer.id))
      : (auth?.sessions || []).map((session) => ({ id: session.customerId, name: session.name }))),
    [isSuperAdmin, customersQuery.data, auth?.sessions]
  );
  const customerId = auth?.activeCustomerId ?? null;
  const token = isSuperAdmin ? auth?.token ?? null : auth?.sessions.find((session) => session.customerId === customerId)?.token ?? null;
  const withCustomer = (payload: AdminGraphPayload): AdminGraphPayload | null =>
    (isSuperAdmin ? (customerId ? { customerId, ...payload } : null) : payload);

  useEffect(() => {
    if (customers.length && !customers.some((customer) => customer.id === customerId)) setActiveCustomer(customers[0].id);
  }, [customers, customerId]);

  const [rolesProjectId, setRolesProjectId] = useState<number | null>(null);
  const [fieldsProjectId, setFieldsProjectId] = useState<number | null>(null);
  const [execProjectId, setExecProjectId] = useState<number | null>(null);

  const projectsQuery = useAdminGraph<Project[]>('all-customer-projects', withCustomer({}), token);
  const projects = useMemo(() => (projectsQuery.data || []).filter((project) => typeof project.id === 'number'), [projectsQuery.data]);

  useEffect(() => {
    const error = projectsQuery.error || customersQuery.error;
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      signOut();
      navigate('/login', { replace: true });
    }
  }, [projectsQuery.error, customersQuery.error]);

  useEffect(() => {
    const first = projects[0]?.id ?? null;
    setRolesProjectId(first);
    setFieldsProjectId(first);
    setExecProjectId(first);
  }, [projects]);

  const base: AdminGraphPayload | null = useMemo(
    () => (projects.length ? withCustomer({ projectIds: projects.map((project) => project.id), filters: {} }) : null),
    [projects, isSuperAdmin, customerId]
  );
  const scoped = (projectId: number | null): AdminGraphPayload | null =>
    (base && projectId ? { ...base, filters: { selectedProjectId: projectId } } : null);

  const userCount = useAdminGraph<UserCountByProject>('user-count-by-project', base, token);
  const usersByType = useAdminGraph<UsersByType>('users-by-type', base, token);
  const lastLogin = useAdminGraph<UserLogin[]>('users-last-login', base, token);
  const roles = useAdminGraph<RoleRow[]>('roles-in-project', scoped(rolesProjectId), token);
  const customFields = useAdminGraph<CountRow[]>('custom-fields-by-module', scoped(fieldsProjectId), token);
  const autoLogging = useAdminGraph<AutoLogging[]>('auto-logging-percentage', base, token);
  const teams = useAdminGraph<Team[]>('teams-user-list', base, token);
  const lastExecution = useAdminGraph<LastExecution[]>('users-last-execution', scoped(execProjectId), token);
  const featureUsage = useAdminGraph<FeatureUsage>('feature-usage-by-project', base, token);

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  let body: JSX.Element;
  if (isSuperAdmin && customersQuery.isError) body = <Notice tone="error" text={`Could not load customers: ${customersQuery.error.message}`} />;
  else if (isSuperAdmin && customersQuery.isLoading) body = <Notice text="Loading customers…" />;
  else if (isSuperAdmin && customers.length === 0) body = <Notice text="No customers found for this environment." />;
  else if (projectsQuery.isError) body = <Notice tone="error" text={`Could not load projects: ${projectsQuery.error.message}`} />;
  else if (projectsQuery.isLoading) body = <Notice text="Loading projects…" />;
  else if (projects.length === 0) body = <Notice text="This account has no projects yet." />;
  else {
    body = (
      <AdminGraphsGrid
        projects={projects}
        userCount={toGraph(userCount)}
        usersByType={toGraph(usersByType)}
        lastLogin={toGraph(lastLogin)}
        lastExecution={toGraph(lastExecution)}
        roles={toGraph(roles)}
        customFields={toGraph(customFields)}
        autoLogging={toGraph(autoLogging)}
        teams={toGraph(teams)}
        featureUsage={toGraph(featureUsage)}
        rolesProjectId={rolesProjectId}
        fieldsProjectId={fieldsProjectId}
        execProjectId={execProjectId}
        onRolesProject={setRolesProjectId}
        onFieldsProject={setFieldsProjectId}
        onExecProject={setExecProjectId}
      />
    );
  }

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
          <div className="flex items-center gap-3">
            {customers.length > 0 && (
              <Select value={customerId ? String(customerId) : undefined} onValueChange={(selected) => setActiveCustomer(Number(selected))}>
                <SelectTrigger className="h-9 w-[260px] bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground">
                  <Building2 className="w-4 h-4 mr-2 opacity-80 shrink-0" />
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">{body}</main>
    </div>
  );
};

export default AdminGraphs;

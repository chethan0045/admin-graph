import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart3, FolderKanban, LogOut, Users, UsersRound } from 'lucide-react';
import { ApiError } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { ChartCard } from '@/components/ChartCard';
import { AdminGraphPayload, useAdminGraph } from '@/hooks/useAdminGraph';
import { MAX_SERIES, daysSince, seriesConfig } from '@/lib/chartPalette';

interface Project { id: number; name: string; }
interface UserCountByProject { projects: { _id: string; count: number }[]; totalActiveUsers: number; totalProjects: number; }
interface UsersByType { breakdown: { _id: string; count: number }[]; totalUsers: number; details: { name: string; type: string }[]; }
interface UserLogin { id: number; name: string; email: string; lastLoginAt: string | null; }
interface RoleRow { _id: string; count: number; users: string[]; }
interface CountRow { _id: string; count: number; }
interface AutoLogging { autoLogging: number; total: number; details: { name: string; mode: string }[]; }
interface Team { _id: string; teamId: number; members: { userId: number; name: string; email: string }[]; }
interface LastExecution { _id: number; createdAt: string; createdByName: string; code: string; executionTypeCode: string; result: string; }
interface FeatureUsage { modules: string[]; projects: { projectId: number; projectName: string; counts: number[]; total: number; modulesUsed: number }[]; totals: number[]; }

interface BarRow { label: string; value: number; }
interface SliceRow { key: string; label: string; value: number; }

const SINGLE = seriesConfig([{ key: 'value', label: 'Count' }]);
const barHeight = (rows: number) => Math.max(220, rows * 30 + 40);
const shorten = (value: string) => (value.length > 18 ? `${value.slice(0, 17)}…` : value);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const apiHost = (() => {
  try {
    return new URL(import.meta.env.VITE_API_TARGET || '').host;
  } catch {
    return '';
  }
})();

function HorizontalBars({ data, suffix = '' }: { data: BarRow[]; suffix?: string }) {
  return (
    <ChartContainer config={SINGLE} className="aspect-auto w-full" style={{ height: barHeight(data.length) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 56, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={140} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={shorten} />
        <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={14}>
          <LabelList dataKey="value" position="right" className="fill-muted-foreground" fontSize={11} formatter={(value: number) => `${value}${suffix}`} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function Donut({ data, centerValue, centerLabel }: { data: SliceRow[]; centerValue: string | number; centerLabel: string }) {
  const config = seriesConfig(data.map((row) => ({ key: row.key, label: row.label })));
  const rows = data.map((row) => ({ ...row, fill: `var(--color-${row.key})` }));
  return (
    <ChartContainer config={config} className="aspect-auto w-full h-[260px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
        <Pie data={rows} dataKey="value" nameKey="key" innerRadius={58} outerRadius={85} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
          <Label
            content={({ viewBox }) => {
              const box = viewBox as { cx?: number; cy?: number } | undefined;
              if (!box || box.cx === undefined || box.cy === undefined) return null;
              return (
                <text x={box.cx} y={box.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={box.cx} y={box.cy - 4} className="fill-foreground text-2xl font-semibold">{centerValue}</tspan>
                  <tspan x={box.cx} y={box.cy + 18} className="fill-muted-foreground text-xs">{centerLabel}</tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  );
}

function FeatureUsageChart({ data }: { data: FeatureUsage }) {
  const ordered = data.modules
    .map((module, index) => ({ module, index, total: data.totals[index] || 0 }))
    .sort((a, b) => b.total - a.total);
  const kept = ordered.slice(0, MAX_SERIES - 1);
  const rest = ordered.slice(MAX_SERIES - 1);
  const keys = [
    ...kept.map((entry) => ({ key: `m${entry.index}`, label: entry.module })),
    ...(rest.length ? [{ key: 'other', label: 'Other' }] : [])
  ];
  const config = seriesConfig(keys);
  const rows = data.projects.map((project) => {
    const row: Record<string, string | number> = { label: project.projectName };
    kept.forEach((entry) => { row[`m${entry.index}`] = project.counts[entry.index] || 0; });
    if (rest.length) row.other = rest.reduce((sum, entry) => sum + (project.counts[entry.index] || 0), 0);
    return row;
  });
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: barHeight(rows.length) + 40 }}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={140} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={shorten} />
        <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {keys.map((entry, index) => (
          <Bar
            key={entry.key}
            dataKey={entry.key}
            stackId="usage"
            fill={`var(--color-${entry.key})`}
            stroke="hsl(var(--card))"
            strokeWidth={2}
            radius={index === keys.length - 1 ? [0, 4, 4, 0] : 0}
            barSize={16}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function KpiTile({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string | number }) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-card-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const AdminGraphs = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [rolesProjectId, setRolesProjectId] = useState<number | null>(null);
  const [fieldsProjectId, setFieldsProjectId] = useState<number | null>(null);
  const [execProjectId, setExecProjectId] = useState<number | null>(null);

  const projectsQuery = useAdminGraph<Project[]>('all-customer-projects', {});
  const projects = useMemo(() => (projectsQuery.data || []).filter((project) => typeof project.id === 'number'), [projectsQuery.data]);

  useEffect(() => {
    const error = projectsQuery.error;
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      signOut();
      navigate('/login', { replace: true });
    }
  }, [projectsQuery.error]);

  useEffect(() => {
    const first = projects[0]?.id ?? null;
    setRolesProjectId(first);
    setFieldsProjectId(first);
    setExecProjectId(first);
  }, [projects]);

  const base: AdminGraphPayload | null = useMemo(
    () => (projects.length ? { projectIds: projects.map((project) => project.id), filters: {} } : null),
    [projects]
  );
  const scoped = (projectId: number | null): AdminGraphPayload | null =>
    base && projectId ? { ...base, filters: { selectedProjectId: projectId } } : null;

  const userCount = useAdminGraph<UserCountByProject>('user-count-by-project', base);
  const usersByType = useAdminGraph<UsersByType>('users-by-type', base);
  const lastLogin = useAdminGraph<UserLogin[]>('users-last-login', base);
  const roles = useAdminGraph<RoleRow[]>('roles-in-project', scoped(rolesProjectId));
  const customFields = useAdminGraph<CountRow[]>('custom-fields-by-module', scoped(fieldsProjectId));
  const autoLogging = useAdminGraph<AutoLogging[]>('auto-logging-percentage', base);
  const teams = useAdminGraph<Team[]>('teams-user-list', base);
  const lastExecution = useAdminGraph<LastExecution[]>('users-last-execution', scoped(execProjectId));
  const featureUsage = useAdminGraph<FeatureUsage>('feature-usage-by-project', base);

  const usersByProject = useMemo<BarRow[]>(
    () => (userCount.data?.projects || []).map((row) => ({ label: row._id, value: row.count })),
    [userCount.data]
  );
  const typeRows = useMemo<SliceRow[]>(
    () => (usersByType.data?.breakdown || []).map((row) => ({ key: slug(row._id), label: row._id, value: row.count })),
    [usersByType.data]
  );
  const loginUsers = useMemo(
    () => (lastLogin.data || []).map((user) => ({ label: user.name || user.email, days: daysSince(user.lastLoginAt) })),
    [lastLogin.data]
  );
  const loginRows = useMemo<BarRow[]>(
    () => loginUsers.filter((user) => user.days !== null).sort((a, b) => a.days - b.days).slice(0, 15).map((user) => ({ label: user.label, value: user.days })),
    [loginUsers]
  );
  const roleRows = useMemo<BarRow[]>(() => (roles.data || []).map((row) => ({ label: row._id, value: row.count })), [roles.data]);
  const fieldRows = useMemo<BarRow[]>(() => (customFields.data || []).map((row) => ({ label: row._id, value: row.count })), [customFields.data]);
  const autoDetails = autoLogging.data?.[0]?.details || [];
  const autoEnabled = autoDetails.filter((project) => project.mode === 'Enabled').length;
  const autoRows: SliceRow[] = autoDetails.length
    ? [
        { key: 'enabled', label: 'Enabled', value: autoEnabled },
        { key: 'disabled', label: 'Disabled', value: autoDetails.length - autoEnabled }
      ].filter((row) => row.value > 0)
    : [];
  const teamRows = useMemo<SliceRow[]>(() => {
    const sorted = (teams.data || [])
      .map((team) => ({ key: `team-${team.teamId}`, label: team._id, value: team.members.length }))
      .sort((a, b) => b.value - a.value);
    if (sorted.length <= MAX_SERIES) return sorted;
    const rest = sorted.slice(MAX_SERIES - 1);
    return [...sorted.slice(0, MAX_SERIES - 1), { key: 'other', label: 'Other', value: rest.reduce((sum, row) => sum + row.value, 0) }];
  }, [teams.data]);
  const execRows = useMemo<BarRow[]>(
    () => (lastExecution.data || [])
      .filter((row) => row.createdAt)
      .map((row) => ({ label: row.createdByName || String(row._id), value: daysSince(row.createdAt) }))
      .sort((a, b) => a.value - b.value)
      .slice(0, 15),
    [lastExecution.data]
  );

  const ProjectSelect = ({ value, onChange }: { value: number | null; onChange: (id: number) => void }) => (
    <Select value={value ? String(value) : undefined} onValueChange={(selected) => onChange(Number(selected))}>
      <SelectTrigger className="h-7 w-[170px] text-xs"><SelectValue placeholder="Select project" /></SelectTrigger>
      <SelectContent>
        {projects.map((project) => (
          <SelectItem key={project.id} value={String(project.id)} className="text-xs">{project.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

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
        {projectsQuery.isError ? (
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-10 text-center text-sm text-destructive">Could not load projects: {projectsQuery.error.message}</CardContent>
          </Card>
        ) : projectsQuery.isLoading ? (
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">Loading projects…</CardContent>
          </Card>
        ) : projects.length === 0 ? (
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">This account has no projects yet.</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiTile icon={FolderKanban} label="Projects" value={userCount.data?.totalProjects ?? projects.length} />
              <KpiTile icon={Users} label="Active users" value={userCount.data?.totalActiveUsers ?? '–'} />
              <KpiTile icon={UsersRound} label="Teams" value={teams.data?.length ?? '–'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartCard
                title="Users by Project"
                info="Number of active users assigned to each project."
                loading={userCount.isLoading}
                error={userCount.error?.message}
                empty={!usersByProject.length}
                table={{ columns: ['Project', 'Users'], rows: usersByProject.map((row) => [row.label, row.value]) }}
              >
                <HorizontalBars data={usersByProject} suffix=" users" />
              </ChartCard>

              <ChartCard
                title="User Distribution by Type"
                info="Admin versus non-admin users in this account."
                loading={usersByType.isLoading}
                error={usersByType.error?.message}
                empty={!typeRows.length}
                table={{ columns: ['User', 'Type'], rows: (usersByType.data?.details || []).map((row) => [row.name, row.type]) }}
              >
                <Donut data={typeRows} centerValue={usersByType.data?.totalUsers ?? 0} centerLabel="users" />
              </ChartCard>

              <ChartCard
                title="Days Since Last Login"
                info="Most recently active users, by days since their last login. The table lists every active user."
                badge={loginRows.length < loginUsers.length ? `Top ${loginRows.length}` : undefined}
                loading={lastLogin.isLoading}
                error={lastLogin.error?.message}
                empty={!loginRows.length}
                table={{ columns: ['User', 'Days since login'], rows: loginUsers.map((user) => [user.label, user.days ?? 'Never']) }}
              >
                <HorizontalBars data={loginRows} suffix=" d" />
              </ChartCard>

              <ChartCard
                title="Days Since Last Execution"
                info="Users by days since the last execution they ran in the selected project."
                loading={lastExecution.isLoading}
                error={lastExecution.error?.message}
                empty={!execRows.length}
                controls={<ProjectSelect value={execProjectId} onChange={setExecProjectId} />}
                table={{ columns: ['User', 'Days since execution'], rows: execRows.map((row) => [row.label, row.value]) }}
              >
                <HorizontalBars data={execRows} suffix=" d" />
              </ChartCard>

              <ChartCard
                title="Roles in Project"
                info="Users per role in the selected project."
                loading={roles.isLoading}
                error={roles.error?.message}
                empty={!roleRows.length}
                controls={<ProjectSelect value={rolesProjectId} onChange={setRolesProjectId} />}
                table={{ columns: ['Role', 'Users', 'Members'], rows: (roles.data || []).map((row) => [row._id, row.count, row.users.join(', ')]) }}
              >
                <HorizontalBars data={roleRows} />
              </ChartCard>

              <ChartCard
                title="Custom Fields by Module"
                info="Custom fields configured per module in the selected project."
                loading={customFields.isLoading}
                error={customFields.error?.message}
                empty={!fieldRows.length}
                controls={<ProjectSelect value={fieldsProjectId} onChange={setFieldsProjectId} />}
                table={{ columns: ['Module', 'Custom fields'], rows: fieldRows.map((row) => [row.label, row.value]) }}
              >
                <HorizontalBars data={fieldRows} />
              </ChartCard>

              <ChartCard
                title="Auto-Logging Adoption"
                info="Projects with automatic defect logging enabled."
                loading={autoLogging.isLoading}
                error={autoLogging.error?.message}
                empty={!autoRows.length}
                table={{ columns: ['Project', 'Auto-logging'], rows: autoDetails.map((row) => [row.name, row.mode]) }}
              >
                <Donut data={autoRows} centerValue={`${autoDetails.length ? Math.round((autoEnabled / autoDetails.length) * 100) : 0}%`} centerLabel="enabled" />
              </ChartCard>

              <ChartCard
                title="Team Member Breakdown"
                info="Active members per team. Teams beyond the first seven are grouped as Other."
                loading={teams.isLoading}
                error={teams.error?.message}
                empty={!teamRows.length}
                table={{ columns: ['Team', 'Members'], rows: (teams.data || []).map((team) => [team._id, team.members.map((member) => member.name).join(', ')]) }}
              >
                <Donut data={teamRows} centerValue={teams.data?.length ?? 0} centerLabel="teams" />
              </ChartCard>

              <ChartCard
                title="Feature Usage by Project"
                info="Items created or run per module in each project. Modules beyond the top seven are grouped as Other."
                loading={featureUsage.isLoading}
                error={featureUsage.error?.message}
                empty={!featureUsage.data?.projects?.length}
                span2
                table={{
                  columns: ['Project', ...(featureUsage.data?.modules || []), 'Total'],
                  rows: (featureUsage.data?.projects || []).map((project) => [project.projectName, ...project.counts, project.total])
                }}
              >
                {featureUsage.data && <FeatureUsageChart data={featureUsage.data} />}
              </ChartCard>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminGraphs;

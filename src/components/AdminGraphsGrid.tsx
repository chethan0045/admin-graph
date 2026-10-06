import { useMemo } from 'react';
import { FolderKanban, Users, UsersRound } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartCard } from '@/components/ChartCard';
import { BarRow, Donut, FeatureUsageChart, HorizontalBars, KpiTile, SliceRow, rank, slug, topBadge } from '@/components/charts';
import { MAX_SERIES, daysSince } from '@/lib/chartPalette';
import type { AutoLogging, CountRow, FeatureUsage, GraphData, LastExecution, Project, RoleRow, Team, UserCountByProject, UserLogin, UsersByType } from '@/types/adminGraphs';

export interface AdminGraphsGridProps {
  projects: Project[];
  userCount: GraphData<UserCountByProject>;
  usersByType: GraphData<UsersByType>;
  lastLogin: GraphData<UserLogin[]>;
  lastExecution: GraphData<LastExecution[]>;
  roles: GraphData<RoleRow[]>;
  customFields: GraphData<CountRow[]>;
  autoLogging: GraphData<AutoLogging[]>;
  teams: GraphData<Team[]>;
  featureUsage: GraphData<FeatureUsage>;
  rolesProjectId: number | null;
  fieldsProjectId: number | null;
  execProjectId: number | null;
  onRolesProject: (id: number | null) => void;
  onFieldsProject: (id: number | null) => void;
  onExecProject: (id: number | null) => void;
}

export function AdminGraphsGrid(props: AdminGraphsGridProps) {
  const { projects, userCount, usersByType, lastLogin, lastExecution, roles, customFields, autoLogging, teams, featureUsage } = props;

  const usersByProject = useMemo<BarRow[]>(
    () => rank((userCount.data?.projects || []).map((row) => ({ label: row._id, value: row.count })), Infinity),
    [userCount.data]
  );
  const usersByProjectTop = useMemo(() => rank(usersByProject, 20), [usersByProject]);
  const featureProjects = featureUsage.data?.projects?.length || 0;
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

  const ProjectSelect = ({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) => (
    <Select value={value ? String(value) : 'all'} onValueChange={(selected) => onChange(selected === 'all' ? null : Number(selected))}>
      <SelectTrigger className="h-7 w-[170px] text-xs"><SelectValue placeholder="All projects" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-xs">All projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={String(project.id)} className="text-xs">{project.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiTile icon={FolderKanban} label="Projects" value={userCount.data?.totalProjects ?? projects.length} />
        <KpiTile icon={Users} label="Active users" value={userCount.data?.totalActiveUsers ?? '–'} />
        <KpiTile icon={UsersRound} label="Teams" value={teams.data?.length ?? '–'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ChartCard
          title="Users by Project"
          info="Active users assigned to each project, highest first. The table lists every project."
          badge={topBadge(usersByProjectTop.length, usersByProject.length)}
          loading={userCount.isLoading}
          error={userCount.error}
          empty={!usersByProject.length}
          table={{ columns: ['Project', 'Users'], rows: usersByProject.map((row) => [row.label, row.value]) }}
        >
          <HorizontalBars data={usersByProjectTop} valueLabel="Users" />
        </ChartCard>

        <ChartCard
          title="User Distribution by Type"
          info="Admin versus non-admin users in this account."
          loading={usersByType.isLoading}
          error={usersByType.error}
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
          error={lastLogin.error}
          empty={!loginRows.length}
          table={{ columns: ['User', 'Days since login'], rows: loginUsers.map((user) => [user.label, user.days ?? 'Never']) }}
        >
          <HorizontalBars data={loginRows} valueLabel="Days since login" />
        </ChartCard>

        <ChartCard
          title="Days Since Last Execution"
          info="Users by days since the last completed execution they ran, across all projects or in the selected one."
          loading={lastExecution.isLoading}
          error={lastExecution.error}
          empty={!execRows.length}
          controls={<ProjectSelect value={props.execProjectId} onChange={props.onExecProject} />}
          table={{ columns: ['User', 'Days since execution'], rows: execRows.map((row) => [row.label, row.value]) }}
        >
          <HorizontalBars data={execRows} valueLabel="Days since execution" />
        </ChartCard>

        <ChartCard
          title="Roles in Project"
          info="Users per role, across all projects or in the selected one."
          loading={roles.isLoading}
          error={roles.error}
          empty={!roleRows.length}
          controls={<ProjectSelect value={props.rolesProjectId} onChange={props.onRolesProject} />}
          table={{ columns: ['Role', 'Users', 'Members'], rows: (roles.data || []).map((row) => [row._id, row.count, row.users.join(', ')]) }}
        >
          <HorizontalBars data={roleRows} valueLabel="Users" />
        </ChartCard>

        <ChartCard
          title="Custom Fields by Module"
          info="Custom fields configured per module, across all projects or in the selected one."
          loading={customFields.isLoading}
          error={customFields.error}
          empty={!fieldRows.length}
          controls={<ProjectSelect value={props.fieldsProjectId} onChange={props.onFieldsProject} />}
          table={{ columns: ['Module', 'Custom fields'], rows: fieldRows.map((row) => [row.label, row.value]) }}
        >
          <HorizontalBars data={fieldRows} valueLabel="Custom fields" />
        </ChartCard>

        <ChartCard
          title="Auto-Logging Adoption"
          info="Projects with automatic defect logging enabled."
          loading={autoLogging.isLoading}
          error={autoLogging.error}
          empty={!autoRows.length}
          table={{ columns: ['Project', 'Auto-logging'], rows: autoDetails.map((row) => [row.name, row.mode]) }}
        >
          <Donut data={autoRows} centerValue={`${autoDetails.length ? Math.round((autoEnabled / autoDetails.length) * 100) : 0}%`} centerLabel="enabled" />
        </ChartCard>

        <ChartCard
          title="Team Member Breakdown"
          info="Active members per team. Teams beyond the first seven are grouped as Other."
          loading={teams.isLoading}
          error={teams.error}
          empty={!teamRows.length}
          table={{ columns: ['Team', 'Members'], rows: (teams.data || []).map((team) => [team._id, team.members.map((member) => member.name).join(', ')]) }}
        >
          <Donut data={teamRows} centerValue={teams.data?.length ?? 0} centerLabel="teams" />
        </ChartCard>

        <ChartCard
          title="Feature Usage by Project"
          info="Items created or run per module, for the projects with the most activity. Modules beyond the top seven are grouped as Other. The table lists every project."
          badge={topBadge(Math.min(15, featureProjects), featureProjects)}
          loading={featureUsage.isLoading}
          error={featureUsage.error}
          empty={!featureUsage.data?.projects?.length}
          span2
          table={{
            columns: ['Project', ...(featureUsage.data?.modules || []), 'Total'],
            rows: (featureUsage.data?.projects || []).map((project) => [project.projectName, ...project.counts, project.total])
          }}
        >
          {featureUsage.data && <FeatureUsageChart data={featureUsage.data} limit={15} />}
        </ChartCard>
      </div>
    </>
  );
}

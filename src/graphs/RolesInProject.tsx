import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { BarRow, HorizontalBars } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { RoleRow } from '@/types/adminGraphs';
import { ProjectSelect, useProjectSelection } from './ProjectSelect';
import type { GraphDefinition, GraphRequest } from './types';

function Card({ projects, scoped, token }: GraphRequest) {
  const [projectId, setProjectId] = useProjectSelection(projects);
  const query = useAdminGraph<RoleRow[]>('roles-in-project', scoped(projectId), token);
  const rows = useMemo<BarRow[]>(() => (query.data || []).map((row) => ({ label: row._id, value: row.count })), [query.data]);
  return (
    <ChartCard
      title="Roles in Project"
      info="Users per role, across all projects or in the selected one."
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      controls={<ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />}
      table={{ columns: ['Role', 'Users', 'Members'], rows: (query.data || []).map((row) => [row._id, row.count, row.users.join(', ')]) }}
    >
      <HorizontalBars data={rows} valueLabel="Users" />
    </ChartCard>
  );
}

export const rolesInProject: GraphDefinition = { id: 'roles-in-project', title: 'Roles in Project', Card };

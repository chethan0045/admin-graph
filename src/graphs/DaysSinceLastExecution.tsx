import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { BarRow, HorizontalBars } from '@/components/charts';
import { daysSince } from '@/lib/chartPalette';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { LastExecution } from '@/types/adminGraphs';
import { ProjectSelect, useProjectSelection } from './ProjectSelect';
import type { GraphDefinition, GraphRequest } from './types';

const TOP = 15;

function Card({ projects, scoped, token }: GraphRequest) {
  const [projectId, setProjectId] = useProjectSelection(projects);
  const query = useAdminGraph<LastExecution[]>('users-last-execution', scoped(projectId), token);
  const rows = useMemo<BarRow[]>(
    () => (query.data || [])
      .filter((row) => row.createdAt)
      .map((row) => ({ label: row.createdByName || String(row._id), value: daysSince(row.createdAt) }))
      .sort((a, b) => a.value - b.value)
      .slice(0, TOP),
    [query.data]
  );
  return (
    <ChartCard
      title="Days Since Last Execution"
      info="Users by days since the last completed execution they ran, across all projects or in the selected one."
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      controls={<ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />}
      table={{ columns: ['User', 'Days since execution'], rows: rows.map((row) => [row.label, row.value]) }}
    >
      <HorizontalBars data={rows} valueLabel="Days since execution" />
    </ChartCard>
  );
}

export const daysSinceLastExecution: GraphDefinition = { id: 'days-since-last-execution', title: 'Days Since Last Execution', Card };

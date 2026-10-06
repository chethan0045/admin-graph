import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { BarRow, HorizontalBars } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { CountRow } from '@/types/adminGraphs';
import { ProjectSelect, useProjectSelection } from './ProjectSelect';
import type { GraphDefinition, GraphRequest } from './types';

function Card({ projects, scoped, token }: GraphRequest) {
  const [projectId, setProjectId] = useProjectSelection(projects);
  const query = useAdminGraph<CountRow[]>('custom-fields-by-module', scoped(projectId), token);
  const rows = useMemo<BarRow[]>(() => (query.data || []).map((row) => ({ label: row._id, value: row.count })), [query.data]);
  return (
    <ChartCard
      title="Custom Fields by Module"
      info="Custom fields configured per module, across all projects or in the selected one."
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      controls={<ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />}
      table={{ columns: ['Module', 'Custom fields'], rows: rows.map((row) => [row.label, row.value]) }}
    >
      <HorizontalBars data={rows} valueLabel="Custom fields" />
    </ChartCard>
  );
}

export const customFieldsByModule: GraphDefinition = { id: 'custom-fields-by-module', title: 'Custom Fields by Module', Card };

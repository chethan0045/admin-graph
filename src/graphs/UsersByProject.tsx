import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { BarRow, HorizontalBars, rank, topBadge } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { UserCountByProject } from '@/types/adminGraphs';
import type { GraphDefinition, GraphRequest } from './types';

const TOP = 20;

function Card({ base, token }: GraphRequest) {
  const query = useAdminGraph<UserCountByProject>('user-count-by-project', base, token);
  const rows = useMemo<BarRow[]>(
    () => rank((query.data?.projects || []).map((row) => ({ label: row._id, value: row.count })), Infinity),
    [query.data]
  );
  const top = useMemo(() => rank(rows, TOP), [rows]);
  return (
    <ChartCard
      title="Users by Project"
      info="Active users assigned to each project, highest first. The table lists every project."
      badge={topBadge(top.length, rows.length)}
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      table={{ columns: ['Project', 'Users'], rows: rows.map((row) => [row.label, row.value]) }}
    >
      <HorizontalBars data={top} valueLabel="Users" />
    </ChartCard>
  );
}

export const usersByProject: GraphDefinition = { id: 'users-by-project', title: 'Users by Project', Card };

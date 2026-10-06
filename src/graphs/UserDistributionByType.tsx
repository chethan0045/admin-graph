import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { Donut, SliceRow, slug } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { UsersByType } from '@/types/adminGraphs';
import type { GraphDefinition, GraphRequest } from './types';

function Card({ base, token }: GraphRequest) {
  const query = useAdminGraph<UsersByType>('users-by-type', base, token);
  const rows = useMemo<SliceRow[]>(
    () => (query.data?.breakdown || []).map((row) => ({ key: slug(row._id), label: row._id, value: row.count })),
    [query.data]
  );
  return (
    <ChartCard
      title="User Distribution by Type"
      info="Admin versus non-admin users in this account."
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      table={{ columns: ['User', 'Type'], rows: (query.data?.details || []).map((row) => [row.name, row.type]) }}
    >
      <Donut data={rows} centerValue={query.data?.totalUsers ?? 0} centerLabel="users" />
    </ChartCard>
  );
}

export const userDistributionByType: GraphDefinition = { id: 'user-distribution-by-type', title: 'User Distribution by Type', Card };

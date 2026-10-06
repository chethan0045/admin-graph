import { ChartCard } from '@/components/ChartCard';
import { FeatureUsageChart, topBadge } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { FeatureUsage } from '@/types/adminGraphs';
import type { GraphDefinition, GraphRequest } from './types';

const TOP = 15;

function Card({ base, token }: GraphRequest) {
  const query = useAdminGraph<FeatureUsage>('feature-usage-by-project', base, token);
  const total = query.data?.projects?.length || 0;
  return (
    <ChartCard
      title="Feature Usage by Project"
      info="Items created or run per module, for the projects with the most activity. Modules beyond the top seven are grouped as Other. The table lists every project."
      badge={topBadge(Math.min(TOP, total), total)}
      loading={query.isLoading}
      error={query.error?.message}
      empty={!total}
      span2
      table={{
        columns: ['Project', ...(query.data?.modules || []), 'Total'],
        rows: (query.data?.projects || []).map((project) => [project.projectName, ...project.counts, project.total])
      }}
    >
      {query.data && <FeatureUsageChart data={query.data} limit={TOP} />}
    </ChartCard>
  );
}

export const featureUsageByProject: GraphDefinition = { id: 'feature-usage-by-project', title: 'Feature Usage by Project', Card };

import { ChartCard } from '@/components/ChartCard';
import { Donut, SliceRow } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { AutoLogging } from '@/types/adminGraphs';
import type { GraphDefinition, GraphRequest } from './types';

function Card({ base, token }: GraphRequest) {
  const query = useAdminGraph<AutoLogging[]>('auto-logging-percentage', base, token);
  const details = query.data?.[0]?.details || [];
  const enabled = details.filter((project) => project.mode === 'Enabled').length;
  const rows: SliceRow[] = details.length
    ? [
        { key: 'enabled', label: 'Enabled', value: enabled },
        { key: 'disabled', label: 'Disabled', value: details.length - enabled }
      ].filter((row) => row.value > 0)
    : [];
  const percent = details.length ? Math.round((enabled / details.length) * 100) : 0;
  return (
    <ChartCard
      title="Auto-Logging Adoption"
      info="Projects with automatic defect logging enabled."
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      table={{ columns: ['Project', 'Auto-logging'], rows: details.map((row) => [row.name, row.mode]) }}
    >
      <Donut data={rows} centerValue={`${percent}%`} centerLabel="enabled" />
    </ChartCard>
  );
}

export const autoLoggingAdoption: GraphDefinition = { id: 'auto-logging-adoption', title: 'Auto-Logging Adoption', Card };

import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { Donut, SliceRow } from '@/components/charts';
import { MAX_SERIES } from '@/lib/chartPalette';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { Team } from '@/types/adminGraphs';
import type { GraphDefinition, GraphRequest } from './types';

function Card({ base, token }: GraphRequest) {
  const query = useAdminGraph<Team[]>('teams-user-list', base, token);
  const rows = useMemo<SliceRow[]>(() => {
    const sorted = (query.data || [])
      .map((team) => ({ key: `team-${team.teamId}`, label: team._id, value: team.members.length }))
      .sort((a, b) => b.value - a.value);
    if (sorted.length <= MAX_SERIES) return sorted;
    const rest = sorted.slice(MAX_SERIES - 1);
    return [...sorted.slice(0, MAX_SERIES - 1), { key: 'other', label: 'Other', value: rest.reduce((sum, row) => sum + row.value, 0) }];
  }, [query.data]);
  return (
    <ChartCard
      title="Team Member Breakdown"
      info="Active members per team. Teams beyond the first seven are grouped as Other."
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      table={{ columns: ['Team', 'Members'], rows: (query.data || []).map((team) => [team._id, team.members.map((member) => member.name).join(', ')]) }}
    >
      <Donut data={rows} centerValue={query.data?.length ?? 0} centerLabel="teams" />
    </ChartCard>
  );
}

export const teamMemberBreakdown: GraphDefinition = { id: 'team-member-breakdown', title: 'Team Member Breakdown', Card };

import { useMemo } from 'react';
import { ChartCard } from '@/components/ChartCard';
import { BarRow, HorizontalBars } from '@/components/charts';
import { daysSince } from '@/lib/chartPalette';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { UserLogin } from '@/types/adminGraphs';
import type { GraphDefinition, GraphRequest } from './types';

const TOP = 15;

function Card({ base, token }: GraphRequest) {
  const query = useAdminGraph<UserLogin[]>('users-last-login', base, token);
  const users = useMemo(
    () => (query.data || []).map((user) => ({ label: user.name || user.email, days: daysSince(user.lastLoginAt) })),
    [query.data]
  );
  const rows = useMemo<BarRow[]>(
    () => users.filter((user) => user.days !== null).sort((a, b) => a.days - b.days).slice(0, TOP).map((user) => ({ label: user.label, value: user.days })),
    [users]
  );
  return (
    <ChartCard
      title="Days Since Last Login"
      info="Most recently active users, by days since their last login. The table lists every active user."
      badge={rows.length < users.length ? `Top ${rows.length}` : undefined}
      loading={query.isLoading}
      error={query.error?.message}
      empty={!rows.length}
      table={{ columns: ['User', 'Days since login'], rows: users.map((user) => [user.label, user.days ?? 'Never']) }}
    >
      <HorizontalBars data={rows} valueLabel="Days since login" />
    </ChartCard>
  );
}

export const daysSinceLastLogin: GraphDefinition = { id: 'days-since-last-login', title: 'Days Since Last Login', Card };

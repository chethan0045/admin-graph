import { FolderKanban, Users, UsersRound } from 'lucide-react';
import { KpiTile } from '@/components/charts';
import { useAdminGraph } from '@/hooks/useAdminGraph';
import type { Team, UserCountByProject } from '@/types/adminGraphs';
import type { GraphRequest } from './types';

export function KpiTiles({ base, token, projects }: GraphRequest) {
  const userCount = useAdminGraph<UserCountByProject>('user-count-by-project', base, token);
  const teams = useAdminGraph<Team[]>('teams-user-list', base, token);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KpiTile icon={FolderKanban} label="Projects" value={userCount.data?.totalProjects ?? projects.length} />
      <KpiTile icon={Users} label="Active users" value={userCount.data?.totalActiveUsers ?? '–'} />
      <KpiTile icon={UsersRound} label="Teams" value={teams.data?.length ?? '–'} />
    </div>
  );
}

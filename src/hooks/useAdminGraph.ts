import { useQuery } from '@tanstack/react-query';
import { adminGraph } from '@/services/api';

export type AdminGraph =
  | 'all-customer-projects'
  | 'user-count-by-project'
  | 'users-last-login'
  | 'users-last-execution'
  | 'users-by-type'
  | 'roles-in-project'
  | 'custom-fields-by-module'
  | 'auto-logging-percentage'
  | 'teams-user-list'
  | 'teams-common-users'
  | 'feature-usage-by-project'
  | 'dormant-accounts'
  | 'activity-explorer';

export interface AdminGraphPayload {
  projectId?: number;
  projectIds?: number[];
  filters?: {
    selectedProjectId?: number;
    dateRange?: { fromDate?: string; toDate?: string };
  };
}

export function useAdminGraph<T>(graph: AdminGraph, payload: AdminGraphPayload | null) {
  return useQuery<T>({
    queryKey: ['admin-graph', graph, payload],
    queryFn: () => adminGraph<T>(graph, payload as AdminGraphPayload),
    enabled: !!payload
  });
}

import type { ComponentType } from 'react';
import type { AdminGraphPayload } from '@/hooks/useAdminGraph';
import type { Project } from '@/types/adminGraphs';

export interface GraphRequest {
  token: string | null;
  projects: Project[];
  base: AdminGraphPayload | null;
  scoped: (projectId: number | null) => AdminGraphPayload | null;
}

export interface GraphDefinition {
  id: string;
  title: string;
  Card: ComponentType<GraphRequest>;
}

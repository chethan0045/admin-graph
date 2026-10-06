import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Project } from '@/types/adminGraphs';

export function useProjectSelection(projects: Project[]) {
  const [projectId, setProjectId] = useState<number | null>(null);
  useEffect(() => { setProjectId(null); }, [projects]);
  return [projectId, setProjectId] as const;
}

export function ProjectSelect({ projects, value, onChange }: { projects: Project[]; value: number | null; onChange: (id: number | null) => void }) {
  return (
    <Select value={value ? String(value) : 'all'} onValueChange={(selected) => onChange(selected === 'all' ? null : Number(selected))}>
      <SelectTrigger className="h-7 w-[170px] text-xs"><SelectValue placeholder="All projects" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all" className="text-xs">All projects</SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={String(project.id)} className="text-xs">{project.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

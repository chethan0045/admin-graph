import { useEffect, useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Building2 } from 'lucide-react';
import { AdminGraphsGrid } from '@/components/AdminGraphsGrid';
import { DEMO_CUSTOMERS, demoDataset } from '@/data/demoGraphs';

const Graphs = () => {
  const [customerId, setCustomerId] = useState(DEMO_CUSTOMERS[0].id);
  const [rolesProjectId, setRolesProjectId] = useState<number | null>(null);
  const [fieldsProjectId, setFieldsProjectId] = useState<number | null>(null);
  const [execProjectId, setExecProjectId] = useState<number | null>(null);

  const customer = DEMO_CUSTOMERS.find((entry) => entry.id === customerId) || DEMO_CUSTOMERS[0];
  const dataset = useMemo(() => demoDataset(customer), [customer]);

  useEffect(() => {
    const first = dataset.projects[0]?.id ?? null;
    setRolesProjectId(first);
    setFieldsProjectId(first);
    setExecProjectId(first);
  }, [dataset]);

  const ready = <T,>(data: T) => ({ data });

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Admin Graphs</h1>
                <Badge variant="secondary">Demo data</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Administration metrics for the selected customer</p>
            </div>
          </div>
          <Select value={String(customerId)} onValueChange={(selected) => setCustomerId(Number(selected))}>
            <SelectTrigger className="w-full sm:w-[280px]">
              <Building2 className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {DEMO_CUSTOMERS.map((entry) => (
                <SelectItem key={entry.id} value={String(entry.id)}>{entry.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <AdminGraphsGrid
          projects={dataset.projects}
          userCount={ready(dataset.userCount)}
          usersByType={ready(dataset.usersByType)}
          lastLogin={ready(dataset.lastLogin)}
          lastExecution={ready(execProjectId ? dataset.lastExecution(execProjectId) : [])}
          roles={ready(rolesProjectId ? dataset.roles(rolesProjectId) : [])}
          customFields={ready(fieldsProjectId ? dataset.customFields(fieldsProjectId) : [])}
          autoLogging={ready(dataset.autoLogging)}
          teams={ready(dataset.teams)}
          featureUsage={ready(dataset.featureUsage)}
          rolesProjectId={rolesProjectId}
          fieldsProjectId={fieldsProjectId}
          execProjectId={execProjectId}
          onRolesProject={setRolesProjectId}
          onFieldsProject={setFieldsProjectId}
          onExecProject={setExecProjectId}
        />
      </div>
    </div>
  );
};

export default Graphs;

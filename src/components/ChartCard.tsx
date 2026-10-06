import { ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, Info, Table2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChartTable {
  columns: string[];
  rows: (string | number)[][];
}

interface ChartCardProps {
  title: string;
  info?: string;
  badge?: string;
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  controls?: ReactNode;
  table?: ChartTable;
  span2?: boolean;
  children: ReactNode;
}

export function ChartCard({ title, info, badge, loading, error, empty, controls, table, span2, children }: ChartCardProps) {
  const [view, setView] = useState<'chart' | 'table'>('chart');

  let body: ReactNode;
  if (loading) {
    body = <Skeleton className="h-[240px] w-full" />;
  } else if (error) {
    body = <div className="h-[240px] flex items-center justify-center text-sm text-destructive">{error}</div>;
  } else if (empty) {
    body = <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">No data</div>;
  } else if (view === 'table' && table) {
    body = (
      <div className="max-h-[320px] overflow-auto rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {table.columns.map((column) => (
                <TableHead key={column} className="text-xs">{column}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex} className="text-xs py-2">{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } else {
    body = children;
  }

  return (
    <Card className={cn('bg-card border border-border shadow-sm flex flex-col', span2 && 'lg:col-span-2')}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <CardTitle className="text-sm font-semibold text-card-foreground truncate">{title}</CardTitle>
          {info && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">{info}</TooltipContent>
            </Tooltip>
          )}
          {badge && <Badge variant="secondary" className="text-[10px] shrink-0">{badge}</Badge>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {controls}
          {table && (
            <div className="flex rounded-md border border-border">
              <Button variant={view === 'chart' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" aria-label="Chart view" onClick={() => setView('chart')}>
                <BarChart3 className="w-3.5 h-3.5" />
              </Button>
              <Button variant={view === 'table' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-2" aria-label="Table view" onClick={() => setView('table')}>
                <Table2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-2">{body}</CardContent>
    </Card>
  );
}

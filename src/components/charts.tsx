import { Bar, BarChart, CartesianGrid, Label, LabelList, Pie, PieChart, XAxis, YAxis } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { MAX_SERIES, seriesConfig } from '@/lib/chartPalette';
import type { FeatureUsage } from '@/types/adminGraphs';

export interface BarRow { label: string; value: number; }
export interface SliceRow { key: string; label: string; value: number; }

export const barHeight = (rows: number) => Math.max(220, rows * 30 + 40);
export const shorten = (value: string) => (value.length > 22 ? `${value.slice(0, 21)}…` : value);
export const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
export const rank = (rows: BarRow[], limit: number) => [...rows].sort((a, b) => b.value - a.value).slice(0, limit);
export const topBadge = (shown: number, total: number) => (shown < total ? `Top ${shown} of ${total}` : undefined);
export const legendClass = 'flex-wrap gap-x-4 gap-y-1 [&>div]:whitespace-nowrap';

function AxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fontSize={11} className="fill-muted-foreground">
      {shorten(String(payload?.value ?? ''))}
    </text>
  );
}

export function HorizontalBars({ data, valueLabel = 'Count' }: { data: BarRow[]; valueLabel?: string }) {
  const config = seriesConfig([{ key: 'value', label: valueLabel }]);
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: barHeight(data.length) }}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={150} interval={0} tickLine={false} axisLine={false} tick={<AxisTick />} />
        <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
        <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={14}>
          <LabelList dataKey="value" position="right" className="fill-muted-foreground" fontSize={11} />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

export function Donut({ data, centerValue, centerLabel }: { data: SliceRow[]; centerValue: string | number; centerLabel: string }) {
  const config = seriesConfig(data.map((row) => ({ key: row.key, label: row.label })));
  const rows = data.map((row) => ({ ...row, fill: `var(--color-${row.key})` }));
  return (
    <ChartContainer config={config} className="aspect-auto w-full h-[260px]">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
        <Pie data={rows} dataKey="value" nameKey="key" innerRadius={58} outerRadius={85} paddingAngle={2} stroke="hsl(var(--card))" strokeWidth={2}>
          <Label
            content={({ viewBox }) => {
              const box = viewBox as { cx?: number; cy?: number } | undefined;
              if (!box || box.cx === undefined || box.cy === undefined) return null;
              return (
                <text x={box.cx} y={box.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={box.cx} y={box.cy - 4} className="fill-foreground text-2xl font-semibold">{centerValue}</tspan>
                  <tspan x={box.cx} y={box.cy + 18} className="fill-muted-foreground text-xs">{centerLabel}</tspan>
                </text>
              );
            }}
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" className={legendClass} />} />
      </PieChart>
    </ChartContainer>
  );
}

export function FeatureUsageChart({ data, limit }: { data: FeatureUsage; limit: number }) {
  const projects = [...data.projects].sort((a, b) => b.total - a.total).slice(0, limit);
  const ordered = data.modules
    .map((module, index) => ({ module, index, total: data.totals[index] || 0 }))
    .sort((a, b) => b.total - a.total);
  const kept = ordered.slice(0, MAX_SERIES - 1);
  const rest = ordered.slice(MAX_SERIES - 1);
  const keys = [
    ...kept.map((entry) => ({ key: `m${entry.index}`, label: entry.module })),
    ...(rest.length ? [{ key: 'other', label: 'Other' }] : [])
  ];
  const config = seriesConfig(keys);
  const rows = projects.map((project) => {
    const row: Record<string, string | number> = { label: project.projectName };
    kept.forEach((entry) => { row[`m${entry.index}`] = project.counts[entry.index] || 0; });
    if (rest.length) row.other = rest.reduce((sum, entry) => sum + (project.counts[entry.index] || 0), 0);
    return row;
  });
  return (
    <ChartContainer config={config} className="aspect-auto w-full" style={{ height: barHeight(rows.length) + 40 }}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="label" width={150} interval={0} tickLine={false} axisLine={false} tick={<AxisTick />} />
        <ChartTooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
        <ChartLegend verticalAlign="top" content={<ChartLegendContent className={legendClass} />} />
        {keys.map((entry, index) => (
          <Bar
            key={entry.key}
            dataKey={entry.key}
            stackId="usage"
            fill={`var(--color-${entry.key})`}
            stroke="hsl(var(--card))"
            strokeWidth={2}
            radius={index === keys.length - 1 ? [0, 4, 4, 0] : 0}
            barSize={14}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export function KpiTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | number }) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold text-card-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

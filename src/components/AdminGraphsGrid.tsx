import { GRAPHS } from '@/graphs';
import { KpiTiles } from '@/graphs/KpiTiles';
import type { GraphRequest } from '@/graphs/types';

export function AdminGraphsGrid({ request }: { request: GraphRequest }) {
  return (
    <>
      <KpiTiles {...request} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {GRAPHS.map((graph) => (
          <graph.Card key={graph.id} {...request} />
        ))}
      </div>
    </>
  );
}

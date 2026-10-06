import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Users } from 'lucide-react';

const Placeholder = ({ kind }: { kind: 'customers' | 'packages' }) => {
  const isCustomers = kind === 'customers';
  const Icon = isCustomers ? Users : Package;
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{isCustomers ? 'Customer Management' : 'Package Builder'}</h1>
              <p className="text-sm text-muted-foreground">{isCustomers ? 'View and manage customer accounts' : 'Create and configure packages'}</p>
            </div>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" />{isCustomers ? 'Add Customer' : 'Create Package'}</Button>
        </div>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            This section is part of the License Management shell and is not wired in this prototype. Admin Graphs is the live page.
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Placeholder;

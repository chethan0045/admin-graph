import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Plus, Users } from 'lucide-react';
import { DEMO_CUSTOMERS } from '@/data/demoGraphs';

const PACKAGES = [
  { name: 'All privileges', cost: 100, start: '2023-01-01' },
  { name: 'Privileges without cloud', cost: 80, start: '2023-01-01' },
  { name: 'Manual testing only', cost: 40, start: '2024-06-01' }
];

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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">{isCustomers ? 'Customers' : 'Packages'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {isCustomers
                    ? ['Customer', 'Projects', 'Users', 'Status'].map((column) => <TableHead key={column}>{column}</TableHead>)
                    : ['Package', 'License cost', 'Start date', 'Status'].map((column) => <TableHead key={column}>{column}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isCustomers
                  ? DEMO_CUSTOMERS.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.projects}</TableCell>
                        <TableCell>{customer.users}</TableCell>
                        <TableCell><Badge variant="secondary">active</Badge></TableCell>
                      </TableRow>
                    ))
                  : PACKAGES.map((entry) => (
                      <TableRow key={entry.name}>
                        <TableCell className="font-medium">{entry.name}</TableCell>
                        <TableCell>{entry.cost}</TableCell>
                        <TableCell>{entry.start}</TableCell>
                        <TableCell><Badge variant="secondary">active</Badge></TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Placeholder;

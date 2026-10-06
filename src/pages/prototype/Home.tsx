import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, BarChart3, ChevronDown, ExternalLink, Globe, Home as HomeIcon, Package, Settings, Users } from 'lucide-react';
import { SHELL_BASE } from './SuperAdminShell';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6">
            <HomeIcon className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Welcome to License Management</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage your customer licenses and package configurations efficiently across different SimplifyQA environments
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-card-foreground">Environment</h3>
                    <p className="text-sm text-muted-foreground">Select your SimplifyQA environment</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground mt-2" />
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Settings className="w-4 h-4 text-primary mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">QA Environment</p>
                    <p className="text-sm text-muted-foreground">Quality Assurance testing environment</p>
                  </div>
                </div>
                <Badge variant="secondary">QA</Badge>
              </div>
              <div className="rounded-lg bg-muted p-4 flex items-start gap-3">
                <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-sm font-mono text-card-foreground break-all">https://qa-simplifyqa.devopsark.com</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground">Access common tasks and features</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={() => navigate(`${SHELL_BASE}/customers`)} className="h-16 justify-start p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Customers</div>
                      <div className="text-xs opacity-90">View and manage customer accounts</div>
                    </div>
                  </div>
                </Button>
                <Button onClick={() => navigate(`${SHELL_BASE}/package-builder`)} variant="outline" className="h-16 justify-start p-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Package Builder</div>
                      <div className="text-xs opacity-90">Create and configure packages</div>
                    </div>
                  </div>
                </Button>
                <Button onClick={() => navigate(`${SHELL_BASE}/admin-graphs`)} variant="outline" className="h-16 justify-start p-4 sm:col-span-2">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Admin Graphs</div>
                      <div className="text-xs opacity-90">Administration metrics per customer</div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;

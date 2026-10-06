import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Loader2 } from 'lucide-react';
import { ApiError, login, verifyEmail } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [companies, setCompanies] = useState<{ id: number; companyName: string }[]>([]);
  const [companyName, setCompanyName] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const describe = (err: unknown) => (err instanceof ApiError || err instanceof Error ? err.message : 'Request failed');

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await verifyEmail(email.trim());
      setLoginToken(response.token);
      setCompanies(response.companies || []);
      setCompanyName(response.companies?.length === 1 ? response.companies[0].companyName : undefined);
      setStep('password');
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await login(email.trim(), password, companyName, loginToken);
      signIn(response.accessToken);
      navigate('/', { replace: true });
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm bg-card border border-border shadow-sm">
        <CardHeader className="space-y-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Admin Graphs</CardTitle>
          <p className="text-sm text-muted-foreground">Sign in with your SimplifyQA account.</p>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <form onSubmit={submitEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={submitPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled />
              </div>
              {companies.length > 1 && (
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={companyName} onValueChange={setCompanyName}>
                    <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.companyName}>{company.companyName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" disabled={busy} onClick={() => { setStep('email'); setPassword(''); setError(null); }}>Back</Button>
                <Button type="submit" className="flex-1" disabled={busy || (companies.length > 1 && !companyName)}>
                  {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Sign in
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

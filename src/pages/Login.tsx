import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError, CustomerSession, Mode, customerName, getOwnCustomer, login, superAdminLogin, verifyEmail, verifySuperAdminEmail } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const describe = (err: unknown) => (err instanceof ApiError || err instanceof Error ? err.message : 'Request failed');

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<Mode>('user');
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginToken, setLoginToken] = useState('');
  const [companies, setCompanies] = useState<{ id: number; companyName: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setStep('email');
    setPassword('');
    setCompanies([]);
    setError(null);
  };

  const submitEmail = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'user') {
        const response = await verifyEmail(email.trim());
        setLoginToken(response.token);
        setCompanies(response.companies || []);
      } else {
        const response = await verifySuperAdminEmail(email.trim());
        setLoginToken(response.token);
      }
      setStep('password');
    } catch (err) {
      setError(describe(err));
    } finally {
      setBusy(false);
    }
  };

  const signInAsUser = async () => {
    const targets = companies.length ? companies.map((company) => company.companyName) : [undefined];
    const sessions: CustomerSession[] = [];
    const failures: string[] = [];
    for (const companyName of targets) {
      try {
        const response = await login(email.trim(), password, companyName, loginToken);
        const name = companyName ?? customerName(await getOwnCustomer(response.accessToken));
        sessions.push({ customerId: response.customerId, name, token: response.accessToken });
      } catch (err) {
        failures.push(`${companyName ?? 'account'}: ${describe(err)}`);
      }
    }
    if (!sessions.length) throw new Error(failures[0] || 'Sign in failed');
    signIn({ mode: 'user', sessions, activeCustomerId: sessions[0].customerId });
  };

  const signInAsSuperAdmin = async () => {
    const response = await superAdminLogin(email.trim(), password, loginToken);
    signIn({ mode: 'super-admin', token: response.accessToken, sessions: [], activeCustomerId: null });
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'user') await signInAsUser();
      else await signInAsSuperAdmin();
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
          <div className="flex rounded-md border border-border p-1 text-xs">
            {(['user', 'super-admin'] as Mode[]).map((option) => (
              <button
                key={option}
                type="button"
                disabled={busy}
                onClick={() => { setMode(option); reset(); }}
                className={cn('flex-1 rounded px-2 py-1.5 font-medium transition-colors', mode === option ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}
              >
                {option === 'user' ? 'SimplifyQA user' : 'Super admin'}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {mode === 'user'
              ? 'Graphs for every customer your account belongs to.'
              : 'Graphs for any customer, using your license-management login.'}
          </p>
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
                <p className="text-xs text-muted-foreground">
                  This email belongs to {companies.length} customers. You will be signed in to each of them and can switch between them on the graphs page.
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" disabled={busy} onClick={reset}>Back</Button>
                <Button type="submit" className="flex-1" disabled={busy}>
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/base/input/input';
import { Button } from '@/components/base/buttons/button';
import { cx } from '@/utils/cx';
import { login } from '@/services/auth-service';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(username, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/logo.png" 
            alt="AutoLedger" 
            className="h-16 w-16 mb-3"
          />
          <p className="text-base font-medium text-secondary">AutoLedger for AIM</p>
        </div>
        
        <div className="bg-primary py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-secondary">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <Input
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e)}
                isRequired
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e)}
                isRequired
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="rounded-md bg-error-secondary p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-error-primary">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                size="lg"
              >
                Sign in
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


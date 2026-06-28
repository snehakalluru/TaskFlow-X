import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { apiRoutes } from '../../lib/apiRoutes';
import { normalizeApiError } from '../../lib/apiErrors';
import { useAuth } from '../../providers/AuthProvider';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const res = await api.post(apiRoutes.login, values);
      const { token, user } = res.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err) {
      setError(normalizeApiError(err).message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-glass p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-white/60 mt-1">Access your workspace</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm text-white/70">Email</label>
            <input className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2" {...register('email')} />
            {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="text-sm text-white/70">Password</label>
            <input type="password" className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2" {...register('password')} />
            {errors.password && <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" className="accent-red-400" {...register('rememberMe')} />
            Remember me
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-red-500 hover:bg-red-400 disabled:opacity-60 disabled:cursor-not-allowed py-2 font-medium"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full rounded-xl border border-white/10 hover:border-white/20 bg-white/5 py-2 font-medium text-white/80"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}


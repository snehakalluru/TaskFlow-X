import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../providers/AuthProvider';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    const res = await api.post('/api/auth/register', values);
    const { token, user } = res.data;
    login(token, user);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 shadow-glass p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-white/60 mt-1">Start organizing your work</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm text-white/70">Name</label>
            <input className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2" {...register('name')} />
            {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name.message}</p>}
          </div>
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

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed py-2 font-medium"
          >
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-xl border border-white/10 hover:border-white/20 bg-white/5 py-2 font-medium text-white/80"
          >
            I already have an account
          </button>
        </form>
      </div>
    </div>
  );
}


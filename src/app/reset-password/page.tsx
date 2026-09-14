'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { brandConfig } from '@/config/brandConfig';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import AuthLayout from '../AuthLayout';

export default function ResetPasswordPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: language === 'en' ? 'Passwords do not match.' : 'Las contraseñas no coinciden.',
        type: 'error'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: language === 'en' ? 'Password must be at least 6 characters.' : 'La contraseña debe tener al menos 6 caracteres.',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast({ title: `Error: ${error.message}`, type: 'error' });
      } else {
        toast({
          title: language === 'en' ? 'Password updated! You can now sign in.' : '¡Contraseña actualizada! Ya puedes iniciar sesión.',
          type: 'success'
        });
        router.push('/login');
      }
    } catch (err: any) {
      toast({
        title: language === 'en' ? 'An unexpected error occurred.' : 'Ocurrió un error inesperado.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <GlassCard>
        <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-primary via-accent-pink to-accent-warm" />

        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-primary to-accent-pink flex items-center justify-center shadow-lg shadow-primary/20 mb-4 animate-float">
            <span className="text-white text-2xl font-bold tracking-tighter">
              {brandConfig.logoText}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm color-transparent -webkit-text-fill-color-transparent select-none">
            {language === 'en' ? 'New Password' : 'Nueva Contraseña'}
          </h1>
          <p className="text-xs text-white/50 mt-1.5 text-center font-medium">
            {language === 'en' ? 'Enter your new password below.' : 'Escribe tu nueva contraseña abajo.'}
          </p>
        </div>

        {!ready ? (
          <p className="text-xs text-white/50 text-center">
            {language === 'en' ? 'Verifying your recovery link...' : 'Verificando tu enlace de recuperación...'}
          </p>
        ) : (
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5 w-full">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
                {language === 'en' ? 'New Password' : 'Nueva Contraseña'}
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
                {language === 'en' ? 'Confirm Password' : 'Confirmar Contraseña'}
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <GlowButton type="submit" disabled={loading} className="mt-2">
              <KeyRound className="w-4 h-4" />
              <span>
                {loading
                  ? (language === 'en' ? 'Updating...' : 'Actualizando...')
                  : (language === 'en' ? 'Update password' : 'Actualizar contraseña')}
              </span>
            </GlowButton>
          </form>
        )}

        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-white/45 hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {language === 'en' ? 'Back to sign in' : 'Volver a iniciar sesión'}
            </span>
          </Link>
        </div>
      </GlassCard>
    </AuthLayout>
  );
}

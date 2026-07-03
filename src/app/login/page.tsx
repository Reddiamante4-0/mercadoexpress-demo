'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, LogIn } from 'lucide-react';
import { brandConfig } from '@/config/brandConfig';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import AuthLayout from '../AuthLayout';

function LoginForm() {
  const { language } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Detect verification success
    if (searchParams.get('verified') === 'true') {
      toast({
        title: language === 'en' 
          ? 'Email Confirmed! Your account has been verified.' 
          : '¡Email Confirmado! Tu cuenta ha sido verificada.',
        type: 'success'
      });
      router.replace('/login');
    }
  }, [searchParams, toast, language, router]);

  useEffect(() => {
    // Escucha la sesión y redirige de inmediato al Dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/dashboard');
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: language === 'en' ? error.message : `Error: ${error.message}`,
          type: 'error'
        });
      } else {
        toast({
          title: language === 'en' ? 'Welcome back!' : '¡Bienvenido de nuevo!',
          type: 'success'
        });
        router.push('/dashboard');
        router.refresh();
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
    <form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
          {language === 'en' ? 'Email Address' : 'Correo Electrónico'}
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          icon={<Mail className="w-4 h-4" />}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center pl-1">
          <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider">
            {language === 'en' ? 'Password' : 'Contraseña'}
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-accent-blue hover:underline font-medium"
          >
            {language === 'en' ? 'Forgot your password?' : '¿Olvidaste tu contraseña?'}
          </Link>
        </div>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          required
        />
      </div>

      <GlowButton type="submit" disabled={loading} className="mt-2">
        <LogIn className="w-4 h-4" />
        <span>
          {loading 
            ? (language === 'en' ? 'Signing In...' : 'Iniciando Sesión...') 
            : (language === 'en' ? 'Sign In' : 'Iniciar Sesión')}
        </span>
      </GlowButton>
    </form>
  );
}

export default function LoginPage() {
  const { language } = useTranslation();

  return (
    <AuthLayout>
      <GlassCard>
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-linear-to-r from-primary via-accent-pink to-accent-warm" />

        {/* App Branding */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-primary to-accent-pink flex items-center justify-center shadow-lg shadow-primary/20 mb-4 animate-float">
            <span className="text-white text-2xl font-bold tracking-tighter">
              {brandConfig.logoText}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-primary via-accent-pink to-accent-warm color-transparent -webkit-text-fill-color-transparent select-none">
            {brandConfig.loginTitle}
          </h1>
          <p className="text-xs text-white/50 mt-1.5 text-center font-medium">
            {language === 'en' ? brandConfig.loginSubtitle.en : brandConfig.loginSubtitle.es}
          </p>
        </div>

        {/* Suspense boundary wrapping the login form logic for search params safety */}
        <Suspense fallback={
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Sign Up Link */}
        <div className="text-center mt-8 text-xs text-white/45">
          {language === 'en' ? "Don't have an account? " : '¿No tienes cuenta? '}
          <Link href="/signup" className="text-accent-blue font-semibold hover:underline">
            {language === 'en' ? 'Sign Up' : 'Regístrate'}
          </Link>
        </div>
      </GlassCard>
    </AuthLayout>
  );
}
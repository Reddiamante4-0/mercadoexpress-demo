'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import { brandConfig } from '@/config/brandConfig';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import AuthLayout from '../AuthLayout';

export default function SignUpPage() {
  const { language } = useTranslation();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: `${origin}/login?verified=true`,
        },
      });

      if (error) {
        toast({
          title: language === 'en' ? error.message : `Error: ${error.message}`,
          type: 'error'
        });
      } else {
        toast({
          title: language === 'en' 
            ? 'Account created! Please check your email to verify your account.' 
            : '¡Cuenta creada! Por favor revisa tu correo electrónico para verificar tu cuenta.',
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
            {brandConfig.signupTitle}
          </h1>
          <p className="text-xs text-white/50 mt-1.5 text-center font-medium">
            {language === 'en' ? brandConfig.signupSubtitle.en : brandConfig.signupSubtitle.es}
          </p>
        </div>

        <form onSubmit={handleSignUp} className="flex flex-col gap-4 w-full">
          {/* Name inputs in a 2-column grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
                {language === 'en' ? 'First Name' : 'Nombre'}
              </label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
                {language === 'en' ? 'Last Name' : 'Apellido'}
              </label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>
          </div>

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
            <label className="text-xs font-semibold text-base-content/75 uppercase tracking-wider pl-1">
              {language === 'en' ? 'Password' : 'Contraseña'}
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

          <GlowButton type="submit" disabled={loading} className="mt-4">
            <UserPlus className="w-4 h-4" />
            <span>
              {loading 
                ? (language === 'en' ? 'Creating Account...' : 'Creando Cuenta...') 
                : (language === 'en' ? 'Create Account' : 'Crear Cuenta')}
            </span>
          </GlowButton>
        </form>

        {/* Login Link */}
        <div className="text-center mt-8 text-xs text-white/45">
          {language === 'en' ? 'Already have an account? ' : '¿Ya tienes cuenta? '}
          <Link href="/login" className="text-accent-blue font-semibold hover:underline">
            {language === 'en' ? 'Sign In' : 'Inicia sesión'}
          </Link>
        </div>
      </GlassCard>
    </AuthLayout>
  );
}

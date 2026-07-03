'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { brandConfig } from '@/config/brandConfig';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlowButton } from '@/components/ui/GlowButton';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/ToastProvider';
import AuthLayout from '../AuthLayout';

export default function ForgotPasswordPage() {
  const { language } = useTranslation();
  const { toast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const origin = window.location.origin;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/login?reset=true`,
      });

      if (error) {
        toast({
          title: language === 'en' ? error.message : `Error: ${error.message}`,
          type: 'error'
        });
      } else {
        toast({
          title: language === 'en' 
            ? 'Recovery email sent! Please check your inbox.' 
            : '¡Correo de recuperación enviado! Por favor revisa tu bandeja de entrada.',
          type: 'success'
        });
        setEmail('');
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
            {brandConfig.forgotPasswordTitle}
          </h1>
          <p className="text-xs text-white/50 mt-1.5 text-center font-medium">
            {language === 'en' ? brandConfig.forgotPasswordSubtitle.en : brandConfig.forgotPasswordSubtitle.es}
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-5 w-full">
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

          <GlowButton type="submit" disabled={loading} className="mt-2">
            <Send className="w-4 h-4" />
            <span>
              {loading 
                ? (language === 'en' ? 'Sending...' : 'Enviando...') 
                : (language === 'en' ? 'Send recovery link' : 'Enviar enlace de recuperación')}
            </span>
          </GlowButton>
        </form>

        {/* Back to Login */}
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

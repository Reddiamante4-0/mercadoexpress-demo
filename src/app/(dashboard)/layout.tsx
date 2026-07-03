'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { brandConfig } from '@/config/brandConfig';
import { Header } from '@/components/dashboard/Header';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { ShieldAlert, Loader2, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useTranslation();
  const router = useRouter();
  const supabase = createClient();

  // Desktop: collapsed sidebar (icons only) vs expanded
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // Mobile: drawer open/closed
  const [mobileOpen, setMobileOpen] = useState(false);

  // Authentication Wall State
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (active) {
            router.push('/login');
          }
          return;
        }

        const email = user.email || '';
        if (active) {
          setUserEmail(email);
          // In MercadoExpress App, any user logged in via Supabase is authorized as admin
          setIsAuthorized(true);
          setAuthLoading(false);
        }
      } catch (err) {
        console.error('Error during authorization verification:', err);
        if (active) {
          setIsAuthorized(false);
          setAuthLoading(false);
          router.push('/login');
        }
      }
    }

    checkAccess();
    return () => {
      active = false;
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 w-full h-dvh flex flex-col items-center justify-center bg-slate-50 z-[9999]">
        {/* Background glowing orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
          <div
            className="absolute -top-40 -left-72"
            style={{
              width: 900,
              height: 900,
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(22,163,74,0.12) 0%, rgba(234,88,12,0.06) 25%, transparent 75%)',
              filter: 'blur(80px)',
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 font-sans">
            {language === 'en' ? 'Verifying access credentials...' : 'Verificando credenciales de acceso...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    /* Outer fixed shell — prevents mobile browser bounce/scroll */
    <div className="fixed inset-0 w-full h-dvh flex overflow-hidden z-0 bg-slate-50">
      {/* Background glowing orbs — fixed to the whole viewport */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div
          className="absolute -top-40 -left-72"
          style={{
            width: 900,
            height: 900,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(22,163,74,0.12) 0%, rgba(234,88,12,0.06) 25%, transparent 75%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2"
          style={{
            width: 520,
            height: 520,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute bottom-0 left-1/3"
          style={{
            width: 550,
            height: 550,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Content column: header + scrollable main */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0 z-10">
        <Header onToggleMobileSidebar={() => setMobileOpen((o) => !o)} />

        {/* Scrollable main area with ambient orbs */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-6 lg:p-8 relative">
          {/* Static ambient orbs inside the scrollable area */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
            <div
              className="absolute -top-40 -left-72"
              style={{
                width: 900,
                height: 900,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(22,163,74,0.12) 0%, rgba(234,88,12,0.06) 25%, transparent 75%)',
                filter: 'blur(80px)',
              }}
            />
            <div
              className="absolute -top-16 -right-10"
              style={{
                width: 420,
                height: 420,
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
          </div>

          {/* Actual page content — above the orbs */}
          <div className="relative z-10">
            {isAuthorized ? (
              children
            ) : (
              <div className="w-full max-w-xl mx-auto my-12 relative z-10 text-left">
                <div className="glass-panel p-8 text-center space-y-6 relative overflow-hidden bg-white shadow-md">
                  {/* Subtle red glow border line on top */}
                  <div className="absolute top-0 left-0 w-full h-[4px] bg-red-500" />
                  
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 animate-pulse">
                    <ShieldAlert className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">
                      {language === 'en' ? 'Access Restricted' : 'Acceso Restringido'}
                    </h2>
                    <p className="text-[11px] font-semibold text-red-600 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full inline-block font-mono">
                      {userEmail}
                    </p>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed font-sans font-medium">
                    {language === 'en'
                      ? `You are not logged in or authorized to manage ${brandConfig.appName}.`
                      : `No has iniciado sesión o no tienes permisos para administrar ${brandConfig.appName}.`}
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleLogout}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white hover:scale-102 active:scale-98 transition-all duration-300 cursor-pointer uppercase tracking-wider"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      {language === 'en' ? 'Sign In / Sign Out' : 'Cerrar Sesión'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

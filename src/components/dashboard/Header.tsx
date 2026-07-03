'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  X,
  Store,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/components/ui/ToastProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { brandConfig } from '@/config/brandConfig';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

// Static fake notifications for the supermarket admin
const NOTIFICATIONS = [
  {
    id: '1',
    icon: <TrendingUp className="w-4 h-4 text-green-600" />,
    bg: 'bg-green-100',
    titleEn: 'New order received: ORD-9826',
    titleEs: 'Nuevo pedido recibido: ORD-9826',
    timeEn: '2 min ago',
    timeEs: 'hace 2 min',
    unread: true,
  },
  {
    id: '2',
    icon: <User className="w-4 h-4 text-orange-500" />,
    bg: 'bg-orange-100',
    titleEn: 'New customer registered: Andrés Castro',
    titleEs: 'Nuevo cliente registrado: Andrés Castro',
    timeEn: '18 min ago',
    timeEs: 'hace 18 min',
    unread: false,
  },
  {
    id: '3',
    icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
    bg: 'bg-red-100',
    titleEn: 'Stock alert: Filete de Salmón Chileno is low (10 left)',
    titleEs: 'Alerta de stock: Filete de Salmón Chileno bajo (quedan 10)',
    timeEn: '1 hr ago',
    timeEs: 'hace 1 hr',
    unread: false,
  },
];

const UNREAD_COUNT = NOTIFICATIONS.filter((n) => n.unread).length;

export function Header({ onToggleMobileSidebar }: HeaderProps) {
  const { language } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  const [userName, setUserName] = useState('');
  const [userInitials, setUserInitials] = useState('A');
  const [userEmail, setUserEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [businessName, setBusinessName] = useState(brandConfig.appName);
  const [minOrderFreeShipping, setMinOrderFreeShipping] = useState(80000);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (avatarRef.current && !avatarRef.current.contains(event.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch profile on mount
  useEffect(() => {
    let active = true;
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (active) {
          const email = user.email || '';
          setUserEmail(email);
          
          // Try loading custom fields from user metadata
          const meta = user.user_metadata || {};
          const fn = meta.first_name || '';
          const ln = meta.last_name || '';
          const ph = meta.phone || '';
          const av = meta.avatar_url || '';

          setFirstName(fn);
          setLastName(ln);
          setPhone(ph);
          setAvatarUrl(av);

          const dispName = fn || email.split('@')[0];
          setUserName(dispName);
          setUserInitials(dispName.charAt(0).toUpperCase());
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      }
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [supabase]);

  const handleOpenProfileModal = () => {
    setEditFirstName(firstName);
    setEditLastName(lastName);
    setEditPhone(phone);
    setAvatarPreview(avatarUrl);
    setAvatarFile(null);
    setProfileModalOpen(true);
    setAvatarOpen(false);
  };

  const handleOpenSettingsModal = () => {
    setSettingsModalOpen(true);
    setAvatarOpen(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let uploadedUrl = avatarUrl;

      // Handle file upload to Supabase storage if file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          console.warn('Could not upload file to storage. Simulating public URL path.');
          uploadedUrl = avatarPreview; // Fallback to simulated local object path
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          uploadedUrl = publicUrl;
        }
      }

      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: editFirstName,
          last_name: editLastName,
          phone: editPhone,
          avatar_url: uploadedUrl,
        },
      });

      if (authError) throw authError;

      setFirstName(editFirstName);
      setLastName(editLastName);
      setPhone(editPhone);
      setAvatarUrl(uploadedUrl);

      const dispName = editFirstName || userEmail.split('@')[0];
      setUserName(dispName);
      setUserInitials(dispName.charAt(0).toUpperCase());

      toast({
        title: language === 'en' ? 'Profile updated successfully!' : '¡Perfil actualizado con éxito!',
        type: 'success',
      });
      setProfileModalOpen(false);
    } catch (err: any) {
      toast({
        title: err.message || 'Error updating profile.',
        type: 'error',
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      // Mock saving to a config table or LocalStorage
      localStorage.setItem('me_business_name', businessName);
      localStorage.setItem('me_min_order_free_shipping', minOrderFreeShipping.toString());

      toast({
        title: language === 'en' ? 'Settings updated successfully!' : '¡Configuración guardada con éxito!',
        type: 'success',
      });
      setSettingsModalOpen(false);
    } catch {
      toast({
        title: 'Error guardando configuraciones.',
        type: 'error',
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ title: error.message, type: 'error' });
      } else {
        toast({
          title: language === 'en' ? 'Signed out successfully!' : '¡Sesión cerrada con éxito!',
          type: 'success',
        });
        router.push('/login');
        router.refresh();
      }
    } catch {
      toast({
        title: language === 'en' ? 'Error signing out.' : 'Error al cerrar sesión.',
        type: 'error',
      });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <header className="shrink-0 h-16 w-full border-b border-slate-200 bg-white flex items-center px-4 sm:px-6 lg:px-8 gap-4 relative z-30 shadow-xs">
        {/* Mobile hamburger */}
        <button
          id="header-menu-btn"
          onClick={onToggleMobileSidebar}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer"
          aria-label={language === 'en' ? 'Open menu' : 'Abrir menú'}
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* View Client Store button */}
        <button
          onClick={() => router.push('/')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition-all"
        >
          <Store className="w-4 h-4 text-green-600" />
          <span>Ver Tienda Pública</span>
        </button>

        {/* Right section */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              id="header-notifications-btn"
              onClick={() => {
                setNotifOpen((p) => !p);
                setAvatarOpen(false);
              }}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all duration-200 cursor-pointer"
              aria-label={language === 'en' ? 'Notifications' : 'Notificaciones'}
            >
              <Bell className="w-4 h-4" />
              {UNREAD_COUNT > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 text-white text-[9px] font-black flex items-center justify-center shadow-lg animate-pulse">
                  {UNREAD_COUNT}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {notifOpen && (
              <div
                id="notifications-dropdown"
                className="absolute right-0 top-12 w-80 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 text-left">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                    {language === 'en' ? 'Notifications' : 'Notificaciones'}
                  </span>
                  <span className="text-[9px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                    {UNREAD_COUNT} {language === 'en' ? 'new' : 'nueva'}
                  </span>
                </div>
                <ul className="py-2 max-h-72 overflow-y-auto text-left">
                  {NOTIFICATIONS.map((n) => (
                    <li
                      key={n.id}
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer',
                        n.unread && 'bg-green-50/40'
                      )}
                    >
                      <div className={cn('mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0', n.bg)}>
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-bold truncate', n.unread ? 'text-slate-800' : 'text-slate-500')}>
                          {language === 'en' ? n.titleEn : n.titleEs}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {language === 'en' ? n.timeEn : n.timeEs}
                        </p>
                      </div>
                      {n.unread && (
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div ref={avatarRef} className="relative">
            <button
              id="header-avatar-btn"
              onClick={() => {
                setAvatarOpen((p) => !p);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all duration-200 cursor-pointer"
            >
              {/* Avatar circle */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover shadow-xs shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-black shadow-xs shrink-0">
                  {userInitials}
                </div>
              )}
              <span className="hidden sm:block text-xs font-bold text-slate-700 max-w-24 truncate">
                {userName || (language === 'en' ? 'Loading...' : 'Cargando...')}
              </span>
              <ChevronDown
                className={cn(
                  'hidden sm:block w-3.5 h-3.5 text-slate-400 transition-transform duration-200',
                  avatarOpen ? 'rotate-180' : ''
                )}
              />
            </button>

            {/* Avatar dropdown */}
            {avatarOpen && (
              <div
                id="avatar-dropdown"
                className="absolute right-0 top-12 w-60 rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl z-50 overflow-hidden"
              >
                {/* User info */}
                <div className="px-4 py-4 border-b border-slate-100 text-left">
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-black shadow-xs shrink-0">
                        {userInitials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{userName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-2 text-left">
                  <button
                    id="avatar-profile-btn"
                    onClick={handleOpenProfileModal}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-green-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    {language === 'en' ? 'Profile Settings' : 'Mi Perfil'}
                  </button>
                  <button
                    id="avatar-settings-btn"
                    onClick={handleOpenSettingsModal}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-green-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    {language === 'en' ? 'App Settings' : 'Ajustes del Negocio'}
                  </button>
                </div>

                <div className="border-t border-slate-100 py-1 text-left">
                  <button
                    id="avatar-logout-btn"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    {loggingOut
                      ? (language === 'en' ? 'Signing out...' : 'Cerrando sesión...')
                      : (language === 'en' ? 'Log Out' : 'Cerrar Sesión')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── PROFILE MODAL ── */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl my-auto text-left">
            <button 
              onClick={() => setProfileModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">
              {language === 'en' ? 'Edit User Profile' : 'Editar Perfil de Administrador'}
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Photo upload section */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/50">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border border-slate-200 bg-slate-200 flex items-center justify-center shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-green-600 flex items-center justify-center text-white text-2xl font-black">
                      {userInitials}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Foto de Perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-[10px] text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:bg-green-600 file:text-white file:cursor-pointer hover:file:bg-green-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Nombre</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Apellido</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Teléfono</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Correo Electrónico (Solo Lectura)</label>
                <input
                  type="text"
                  disabled
                  value={userEmail}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-400 cursor-not-allowed select-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingProfile && <Loader2 className="w-3 h-3 animate-spin" />}
                  {language === 'en' ? 'Save' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SETTINGS MODAL ── */}
      {settingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl my-auto text-left">
            <button 
              onClick={() => setSettingsModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4">
              {language === 'en' ? 'Business Settings' : 'Ajustes de MercadoExpress'}
            </h3>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Nombre Comercial del Negocio</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1">Mínimo de Compra para Envío Gratis (COP)</label>
                <input
                  type="number"
                  value={minOrderFreeShipping}
                  onChange={(e) => setMinOrderFreeShipping(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-hidden focus:border-green-600 focus:ring-1 focus:ring-green-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                >
                  {language === 'en' ? 'Cancel' : 'Cancelar'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-600 hover:bg-green-700 text-white transition-all cursor-pointer"
                >
                  {language === 'en' ? 'Save Settings' : 'Guardar Ajustes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

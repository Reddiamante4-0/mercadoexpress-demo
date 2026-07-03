'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { brandConfig } from '@/config/brandConfig';
import {
  X,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  TrendingUp,
  Store
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  href: string;
  icon: React.ReactNode;
  labelEn: string;
  labelEs: string;
}

const NAV_SECTIONS = [
  {
    titleEn: 'Business Admin',
    titleEs: 'Administración',
    items: [
      {
        href: '/dashboard',
        icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
        labelEn: 'Overview',
        labelEs: 'Resumen General',
      },
      {
        href: '/dashboard/productos',
        icon: <Package className="w-5 h-5 shrink-0" />,
        labelEn: 'Products',
        labelEs: 'Productos',
      },
      {
        href: '/dashboard/pedidos',
        icon: <ClipboardList className="w-5 h-5 shrink-0" />,
        labelEn: 'Orders',
        labelEs: 'Pedidos Recibidos',
      },
      {
        href: '/dashboard/clientes',
        icon: <Users className="w-5 h-5 shrink-0" />,
        labelEn: 'Customers',
        labelEs: 'Clientes',
      },
      {
        href: '/dashboard/ventas',
        icon: <TrendingUp className="w-5 h-5 shrink-0" />,
        labelEn: 'Sales Report',
        labelEs: 'Reporte de Ventas',
      },
    ],
  },
];

function NavLink({
  item,
  collapsed,
  onCloseMobile,
}: {
  item: NavItem;
  collapsed: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { language } = useTranslation();
  
  // Exact match for dashboard, startswith for subpages
  const isActive = item.href === '/dashboard' 
    ? pathname === '/dashboard' 
    : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <Link
      href={item.href}
      onClick={onCloseMobile}
      title={collapsed ? (language === 'en' ? item.labelEn : item.labelEs) : undefined}
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 group relative cursor-pointer',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-green-50 text-green-700 border border-green-200/50 shadow-xs'
          : 'text-slate-600 hover:text-green-700 hover:bg-slate-100 border border-transparent'
      )}
    >
      <span
        className={cn(
          'transition-colors duration-200',
          isActive ? 'text-green-600' : 'text-slate-400 group-hover:text-green-600'
        )}
      >
        {item.icon}
      </span>
      {!collapsed && (
        <span className="truncate">
          {language === 'en' ? item.labelEn : item.labelEs}
        </span>
      )}
      {/* Active indicator dot */}
      {isActive && !collapsed && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
      )}
    </Link>
  );
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
  onCloseMobile,
  showCloseButton = false,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  showCloseButton?: boolean;
}) {
  const { language } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-5 border-b border-slate-100 shrink-0',
          collapsed ? 'justify-center' : ''
        )}
      >
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-md shrink-0">
          <Store className="w-4.5 h-4.5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-sm font-black text-green-600 truncate leading-none">
              {brandConfig.appName}
            </span>
            <span className="text-[9px] text-slate-400 font-bold mt-1 truncate">
              Admin Panel
            </span>
          </div>
        )}
        {/* Mobile close button */}
        {showCloseButton && (
          <button
            onClick={onCloseMobile}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label={language === 'en' ? 'Close menu' : 'Cerrar menú'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.titleEn}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">
                {language === 'en' ? section.titleEn : section.titleEs}
              </p>
            )}
            {collapsed && <div className="mb-2 mx-3 border-t border-slate-100" />}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onCloseMobile={onCloseMobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="shrink-0 px-3 py-4 border-t border-slate-100">
        <button
          onClick={onToggleCollapse}
          title={
            collapsed
              ? (language === 'en' ? 'Expand sidebar' : 'Expandir sidebar')
              : (language === 'en' ? 'Collapse sidebar' : 'Contraer sidebar')
          }
          className={cn(
            'flex items-center gap-2 w-full rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 text-slate-400 hover:text-green-700 hover:bg-slate-100 border border-transparent',
            collapsed ? 'justify-center' : ''
          )}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4 shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="w-4 h-4 shrink-0" />
              <span>{language === 'en' ? 'Collapse' : 'Contraer'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-full transition-all duration-300 shrink-0 border-r border-slate-200/80 bg-white',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          showCloseButton={false}
        />
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300',
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 lg:hidden flex flex-col bg-white border-r border-slate-200',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent
          collapsed={false}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
          showCloseButton={true}
        />
      </aside>
    </>
  );
}

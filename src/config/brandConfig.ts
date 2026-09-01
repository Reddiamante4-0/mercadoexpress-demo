export interface BrandConfig {
  appName: string;
  appSubtitle: {
    en: string;
    es: string;
  };
  logoText: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  loginTitle: string;
  loginSubtitle: {
    en: string;
    es: string;
  };
  signupTitle: string;
  signupSubtitle: {
    en: string;
    es: string;
  };
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: {
    en: string;
    es: string;
  };
  dashboardTitle: {
    en: string;
    es: string;
  };
  dashboardSubtitle: {
    en: string;
    es: string;
  };
  whatsappNumber: string;
}

export const brandConfig: BrandConfig = {
  appName: "Crisalap",
  appSubtitle: {
    en: "Digital Supermarket at home",
    es: "Tu supermercado digital a domicilio",
  },
  logoText: "ME",
  logoUrl: "", // Can be filled with a custom logo URL when needed
  primaryColor: "primary",
  secondaryColor: "accent-warm",
  loginTitle: "Crisalap Admin",
  loginSubtitle: {
    en: "Business Management Dashboard",
    es: "Panel de administración del negocio",
  },
  signupTitle: "Crisalap Admin",
  signupSubtitle: {
    en: "Register your administrative account",
    es: "Registra tu cuenta administrativa",
  },
  forgotPasswordTitle: "Crisalap Admin",
  forgotPasswordSubtitle: {
    en: "Recover admin password",
    es: "Recuperar contraseña de administrador",
  },
  dashboardTitle: {
    en: "Crisalap Manager",
    es: "Administración Crisalap",
  },
  dashboardSubtitle: {
    en: "Manage products, track orders, adjust stock levels, and view sales details in real-time.",
    es: "Administra productos, gestiona pedidos, ajusta niveles de inventario y analiza ventas en tiempo real.",
  },
  whatsappNumber: "+573124567890",
};

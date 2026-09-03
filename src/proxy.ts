import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  try {
    const { user, response } = await updateSession(request);
    const path = request.nextUrl.pathname;

    const hostname = request.headers.get('host') || '';
    const rootDomain = 'crisalap.com';
    let subdomain: string | null = null;

    if (hostname.endsWith(`.${rootDomain}`)) {
      const candidate = hostname.replace(`.${rootDomain}`, '');
      if (candidate && candidate !== 'www') {
        subdomain = candidate;
      }
    }

    const isStorefrontPath =
      path === '/' ||
      path.startsWith('/checkout') ||
      path.startsWith('/order-success');

    if (subdomain && isStorefrontPath && !path.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = path === '/' ? `/${subdomain}` : `/${subdomain}${path}`;
      return NextResponse.rewrite(url);
    }

    // 1. Omitir archivos estáticos y APIs (Protección del Webhook)
    if (
      path.startsWith('/_next') ||
      path.includes('/api/') ||
      path.includes('.')
    ) {
      return response;
    }

    const isDashboardRoute = path.startsWith('/dashboard');
    const isAuthRoute = path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/forgot-password');

    // 2. Si intenta entrar a /dashboard sin estar logueado -> Login
    if (isDashboardRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const redirectResponse = NextResponse.redirect(url);
      
      // Propagar cookies actualizadas
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }

    // 3. Si ya está logueado e intenta entrar al Login -> Dashboard
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      const redirectResponse = NextResponse.redirect(url);
      
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      return redirectResponse;
    }

    // 4. Todo lo demás (incluyendo /[store_slug]) pasa libremente
    return response;
    
  } catch (error) {
    console.error('Error in proxy middleware:', error);
    const path = request.nextUrl.pathname;
    const isDashboardRoute = path.startsWith('/dashboard');
    
    // Si el middleware falla, fallamos de forma segura protegiendo el dashboard
    if (isDashboardRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - SVG, PNG, JPG files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export default proxy;

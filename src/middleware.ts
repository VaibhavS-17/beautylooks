import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Default-deny: Only these routes are public. Everything else requires auth.
const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/blog',
  '/login',
  '/register',
  '/auth/callback',
  '/checkout',
];

// Routes that redirect authenticated users away (login/register)
const AUTH_ONLY_ROUTES = ['/login', '/register'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(route + '/');
  });
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Determine if route needs auth
  const isPublic = isPublicRoute(pathname);
  const isAuthPage = AUTH_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  // 2. For fully public non-auth pages, skip session check
  if (isPublic && !isAuthPage) {
    return NextResponse.next();
  }

  // 3. Initialize Supabase for session validation
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Secure check using getUser() instead of getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Redirect authenticated users away from login/register to account
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  // 5. Default-deny: redirect unauthenticated users to login for protected routes
  if (!isPublic && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2)$).*)',
  ],
};

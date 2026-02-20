'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Preloader } from '@/components/layout/Preloader';

const PUBLIC_ROUTES = ['/login', '/unauthorized'];

const ROLE_HOME_MAP: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  ADMIN: '/admin/dashboard',
  BUYER: '/admin/dashboard',
  OPERATION: '/operations/dashboard',
};

const REDIRECT_KEY = 'redirectAfterLogin';

function getHomeForRole(role?: string): string {
  return role ? (ROLE_HOME_MAP[role] ?? '/login') : '/login';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  useEffect(() => {
    if (status === 'loading') return;

    // Session expired or unauthenticated while on a protected route
    if (status === 'unauthenticated') {
      if (!isPublicRoute) {
        // Save where user was so we can restore after re-login
        sessionStorage.setItem(REDIRECT_KEY, pathname);
        router.replace('/login');
      }
      return;
    }

    // Authenticated
    if (status === 'authenticated' && session?.user) {
      // Check for token error (expired refresh token)
      if ((session as { error?: string }).error === 'RefreshAccessTokenError') {
        if (!isPublicRoute) {
          sessionStorage.setItem(REDIRECT_KEY, pathname);
        }
        router.replace('/login');
        return;
      }

      // If on a public route (e.g. /login), redirect to saved path or role home
      if (isPublicRoute && !hasRedirected.current) {
        hasRedirected.current = true;
        const saved = sessionStorage.getItem(REDIRECT_KEY);
        if (saved) {
          sessionStorage.removeItem(REDIRECT_KEY);
          router.replace(saved);
        } else {
          router.replace(getHomeForRole(session.user.role));
        }
      }
    }
  }, [status, session, pathname, isPublicRoute, router]);

  // Reset redirect guard when pathname changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  // Show loader while session resolves
  if (status === 'loading') {
    return <Preloader message="Loading, hang tight..." variant="default" />;
  }

  // Block protected pages from rendering while redirecting unauthenticated user
  if (status === 'unauthenticated' && !isPublicRoute) {
    return <Preloader message="Redirecting to login..." variant="default" />;
  }

  return <>{children}</>;
}
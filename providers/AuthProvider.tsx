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

    if (status === 'unauthenticated') {
      if (!isPublicRoute) {
        sessionStorage.setItem(REDIRECT_KEY, pathname);
        router.replace('/login');
      }
      return;
    }

    if (status === 'authenticated' && session?.user) {
      if ((session as { error?: string }).error === 'RefreshAccessTokenError') {
        if (!isPublicRoute) {
          sessionStorage.setItem(REDIRECT_KEY, pathname);
        }
        router.replace('/login');
        return;
      }

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

  useEffect(() => {
    hasRedirected.current = false;
  }, [pathname]);

  if (status === 'loading') {
    return <Preloader message="Loading, hang tight..." variant="default" />;
  }

  if (status === 'unauthenticated' && !isPublicRoute) {
    return <Preloader message="Redirecting to login..." variant="default" />;
  }

  return <>{children}</>;
}
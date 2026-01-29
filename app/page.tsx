'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Preloader } from '@/components/layout/Preloader';

export default function RootPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading') return;

    const timer = setTimeout(() => {
      if (status === 'authenticated' && session?.user) {
        const role = session.user.role;

        // Route based on user role
        switch (role) {
          case 'SUPER_ADMIN':
          case 'ADMIN':
          case 'BUYER':
            router.push('/admin/dashboard');
            break;
          case 'OPERATION':
            router.push('/operations/dashboard');
            break;
          default:
            // Unknown role, redirect to login
            router.push('/login');
        }
      } else {
        // Not authenticated - save current path and redirect to login
        if (pathname !== '/') {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        router.push('/login');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [status, session, router, pathname]);

  return <Preloader message="Loading hang tight..." variant="default" />;
}
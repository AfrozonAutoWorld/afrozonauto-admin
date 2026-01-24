'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Preloader } from '@/components/layout/Preloader';

export default function RootPage() {
  const router = useRouter();
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
            router.push('/admin');
            break;
          case 'OPERATION':
            router.push('/operations');
            break;
          default:
            // Unknown role, redirect to login
            router.push('/login');
        }
      } else {
        // Not authenticated
        router.push('/login');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [status, session, router]);

  return <Preloader message="Loading hang tight..." variant="default" />;
}
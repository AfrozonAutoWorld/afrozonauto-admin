// app/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Preloader } from '@/components/layout/Preloader';

export default function RootPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated') {
      const role = session?.user?.role;
      if (role === 'SUPER_ADMIN' || role === 'OPERATIONS_ADMIN') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/unauthorized');
      }
    }
  }, [status, session, router]);

  return <Preloader message="Redirecting..." variant="default" />;
}

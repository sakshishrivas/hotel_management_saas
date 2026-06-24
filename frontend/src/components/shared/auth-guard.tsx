'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated && !pathname.startsWith('/login')) {
      router.push('/login');
    }
  }, [isAuthenticated, isClient, router, pathname]);

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  if (!isAuthenticated && !pathname.startsWith('/login')) {
    return null; // Prevent flash of protected content
  }

  return <>{children}</>;
}

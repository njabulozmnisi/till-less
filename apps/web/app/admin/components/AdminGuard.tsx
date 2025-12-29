'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../src/store/store';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!user?.roles || !user.roles.includes('ADMIN')) {
      router.push('/');
      return;
    }
  }, [token, user, router]);

  if (!token || !user?.roles?.includes('ADMIN')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You must be an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHotelEngineering } from '@/lib/store';

export default function RootPage() {
  const router = useRouter();
  const { currentUser } = useHotelEngineering();

  useEffect(() => {
    if (!currentUser || !currentUser.username) {
      router.replace('/login');
    } else if (currentUser.role === 'EXECUTIVE') {
      router.replace('/executive');
    } else {
      router.replace('/engineering');
    }
  }, [currentUser, router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400 animate-pulse">
      Redirecting to Hotel Engineering Portal...
    </div>
  );
}

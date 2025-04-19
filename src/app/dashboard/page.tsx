'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";

// Import components
const UserDashboard = dynamic(() => import('@/components/UserDashboard').then(mod => mod.default), { ssr: false });
const MiniLeaderboard = dynamic(() => import('@/components/MiniLeaderboard').then(mod => mod.MiniLeaderboard), { ssr: false });

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle authentication
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">SOC Analyst Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    redirect('/login');
    return null;
  }
  
  const userId = session?.user?._id as string;
  
  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">SOC Analyst Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-2">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">SOC Analyst Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <UserDashboard userId={userId} />
        </div>
        <div className="col-span-1 space-y-6">
          <div className="sticky top-6">
            <MiniLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}

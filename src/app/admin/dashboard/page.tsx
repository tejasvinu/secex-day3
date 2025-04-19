'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, FileText, Settings } from "lucide-react";

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [observationCount, setObservationCount] = useState<number | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch counts in parallel
        const [obsRes, userRes] = await Promise.all([
          fetch('/api/observations/count'), // Keep using observation endpoint
          fetch('/api/users/count')
        ]);

        if (!obsRes.ok || !userRes.ok) {
          // Handle potential errors from either fetch
          const obsError = !obsRes.ok ? await obsRes.json() : null;
          const userError = !userRes.ok ? await userRes.json() : null;
          throw new Error(obsError?.message || userError?.message || 'Failed to fetch dashboard data');
        }

        const obsData = await obsRes.json();
        const userData = await userRes.json();

        setObservationCount(obsData.count);
        setUserCount(userData.count);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      // @ts-ignore
      if (session.user?.role !== 'admin') {
        router.push('/dashboard'); // Redirect non-admins
      } else {
        fetchData();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  // Render states
  if (status === 'loading' || isLoading) {
    return <p className="text-center p-4">Loading Admin Dashboard...</p>;
  }

  if (status === 'unauthenticated') {
    return <p className="text-center p-4">Redirecting to login...</p>;
  }

  // @ts-ignore
  if (session?.user?.role !== 'admin') {
    return <p className="text-center p-4">Access Denied. Redirecting...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Manage Events Card (Previously Observations) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            {/* Updated Title */}
            <CardTitle className="text-sm font-medium">Manage Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {observationCount !== null ? observationCount : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              {/* Updated description */}
              Total events submitted
            </p>
          </CardContent>
          <CardFooter>
            {/* Updated Link Path and Button Text */}
            <Link href="/admin/observations" passHref>
              <Button size="sm">View/Verify Events</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Manage Users Card (No change needed here) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manage Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userCount !== null ? userCount : 'Loading...'}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered participants & admins
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" disabled>Manage Users (Not Implemented)</Button>
          </CardFooter>
        </Card>

        {/* CTF Settings Card (No change needed here) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTF Settings</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure event details, scoring rules, timing, etc.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" disabled>Configure (Not Implemented)</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

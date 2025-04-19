'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Users, Trophy, ChevronDown, ChevronRight } from "lucide-react";

// Define the structure of the data received from the API
interface SuccessfulEventDetail {
  _id: string;
  eventHeading: string;
  eventSummary: string;
  timeNoted: string;
  score: number;
  adminNotes?: string;
  submittedAt: string;
}

interface UserWithEvents {
  userId: string;
  email?: string;
  teamName?: string;
  successfulEvents: SuccessfulEventDetail[];
  totalScore: number;
}

export default function SuccessfulEventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  // State to hold the user-grouped data
  const [userData, setUserData] = useState<UserWithEvents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to track expanded rows
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Fetch user-grouped successful observations
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/observations/admin/successful');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch successful event data');
        }
        const data: UserWithEvents[] = await response.json();
        setUserData(data); // Data is already grouped and sorted by API

      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === 'authenticated') {
      // @ts-ignore
      if (session.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchUserData();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  // Toggle expanded row
  const toggleRow = (userId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Render states
  if (status === 'loading' || isLoading) {
    return <p className="text-center p-4">Loading Leaderboard...</p>;
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Leaderboard / Successful Events</h1>
        {/* Add filtering/sorting options here if needed later */}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {userData.length === 0 && !isLoading && (
        <p>No successfully verified events found yet.</p>
      )}

      {userData.length > 0 && (
        <Table>
          <TableCaption>List of users/teams and their successful event submissions.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead><TableHead>Rank</TableHead><TableHead>Team / User</TableHead><TableHead className="text-right">Total Score</TableHead><TableHead className="text-right">Verified Events</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userData.map((user, index) => {
              const isExpanded = expandedRows.has(user.userId);
              return (
                <React.Fragment key={user.userId}>
                  <TableRow className="hover:bg-muted/50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRow(user.userId)}
                        disabled={user.successfulEvents.length === 0}
                      >
                        {user.successfulEvents.length > 0 ? (
                          isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                        ) : null}
                      </Button>
                    </TableCell><TableCell>{index + 1}</TableCell><TableCell className="font-medium">
                      {user.teamName || user.email || 'Unknown'}
                      {user.teamName && <span className="text-xs text-muted-foreground ml-2">({user.email})</span>}
                    </TableCell><TableCell className="text-right font-bold text-lg text-green-600">{user.totalScore}</TableCell><TableCell className="text-right">{user.successfulEvents.length}</TableCell>
                  </TableRow>
                  {/* Expanded Row Content */}
                  {isExpanded && (
                    <TableRow className="bg-muted/20 hover:bg-muted/30">
                      <TableCell colSpan={5} className="p-0">
                        <div className="p-4">
                          <h4 className="font-semibold mb-2 text-sm">Successful Events ({user.successfulEvents.length}):</h4>
                          {user.successfulEvents.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                              {user.successfulEvents.map(event => (
                                <li key={event._id}>
                                  <span className="font-medium">{event.eventHeading}</span> (Score: {event.score})
                                  <p className="text-xs text-muted-foreground">Noted: {event.timeNoted}, Submitted: {new Date(event.submittedAt).toLocaleString()}</p>
                                  {event.adminNotes && <p className="text-xs text-blue-600 italic">Notes: {event.adminNotes}</p>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No successful events recorded.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

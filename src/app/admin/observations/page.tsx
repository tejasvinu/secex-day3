'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { SecurityEventObservation } from '@/types/securityEventObservation';
import { Types } from 'mongoose';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ObservationWithUser extends Omit<SecurityEventObservation, '_id'> {
  _id: string; // Keep as string since this is how MongoDB ObjectId is serialized in JSON
  userId?: {
    _id: string;
    email?: string;
    name?: string;
  };
}

interface UpdateStatus {
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface FormState {
  score: number;
  notes: string;
}

export default function AdminObservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [observations, setObservations] = useState<ObservationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{ [key: string]: UpdateStatus }>({});
  // New state for managing scores and notes
  const [formStates, setFormStates] = useState<{ [key: string]: FormState }>({});

  // Initialize or update form states when observations change
  useEffect(() => {
    const newFormStates = observations.reduce((acc, obs) => {
      if (!acc[obs._id]) {
        acc[obs._id] = {
          score: obs.score ?? 0,
          notes: obs.adminNotes ?? '',
        };
      }
      return acc;
    }, { ...formStates });
    setFormStates(newFormStates);
  }, [observations]);

  const fetchObservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/observations/admin');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events for verification');
      }
      const data: ObservationWithUser[] = await response.json();
      setObservations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      // @ts-ignore
      if (session.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchObservations();
      }
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleVerify = async (observationId: string, isVerified: boolean) => {
    const formState = formStates[observationId];
    if (!formState) return;

    setUpdateStatus(prev => ({ 
      ...prev, 
      [observationId]: { loading: true, error: null, success: null } 
    }));

    try {
      const response = await fetch(`/api/observations/admin/${observationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isVerified, 
          score: isVerified ? formState.score : 0,
          adminNotes: formState.notes 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update event verification');
      }

      setUpdateStatus(prev => ({
        ...prev,
        [observationId]: { loading: false, error: null, success: 'Update successful!' }
      }));
      fetchObservations();

    } catch (err: any) {
      console.error("Verification error:", err);
      setUpdateStatus(prev => ({
        ...prev,
        [observationId]: { loading: false, error: err.message || 'An error occurred', success: null }
      }));
    }
  };

  const handleFormChange = (observationId: string, field: keyof FormState, value: string | number) => {
    setFormStates(prev => ({
      ...prev,
      [observationId]: {
        ...prev[observationId],
        [field]: value
      }
    }));
  };

  if (status === 'loading' || isLoading) {
    return <p className="text-center p-4">Loading...</p>;
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
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Verify Submitted Events</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {observations.length === 0 && !isLoading && (
        <p>No events awaiting verification.</p>
      )}

      <div className="space-y-4">
        {observations.map((obs) => {
          const currentStatus = updateStatus[obs._id] || { loading: false, error: null, success: null };
          const formState = formStates[obs._id] || { score: 0, notes: '' };

          return (
            <Card key={obs._id}>
              <CardHeader>
                <CardTitle>{obs.eventHeading}</CardTitle>
                <CardDescription>
                  Submitted by: {obs.userId?.email || 'Unknown User'} at {new Date(obs.submittedAt).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Summary:</strong> {obs.eventSummary}</p>
                <p><strong>Time Noted (in ELK):</strong> {obs.timeNoted}</p>
                <div className="mt-4 space-y-2">
                  <div>
                    <Label htmlFor={`score-${obs._id}`}>Score</Label>
                    <Input
                      id={`score-${obs._id}`}
                      type="number"
                      value={formState.score}
                      onChange={(e) => handleFormChange(obs._id, 'score', parseInt(e.target.value, 10) || 0)}
                      min="0"
                      className="w-24"
                      disabled={currentStatus.loading}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`notes-${obs._id}`}>Admin Notes</Label>
                    <Textarea
                      id={`notes-${obs._id}`}
                      value={formState.notes}
                      onChange={(e) => handleFormChange(obs._id, 'notes', e.target.value)}
                      placeholder="Add verification notes here..."
                      disabled={currentStatus.loading}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerify(obs._id, true)}
                    disabled={currentStatus.loading}
                  >
                    {currentStatus.loading ? 'Verifying...' : 'Mark as Correct'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleVerify(obs._id, false)}
                    disabled={currentStatus.loading}
                  >
                    {currentStatus.loading ? 'Verifying...' : 'Mark as Incorrect'}
                  </Button>
                </div>
                {currentStatus.error && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertCircle className="h-4 w-4 mr-1" /> Error: {currentStatus.error}
                  </Badge>
                )}
                {currentStatus.success && (
                  <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" /> {currentStatus.success}
                  </Badge>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

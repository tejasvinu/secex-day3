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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Filters {
  category: string;
  status: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime: string; // Added for start time
  endTime: string;   // Added for end time
}

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

const EVENT_CATEGORIES = {
  all: 'All Events',
  win: 'Windows Events',
  rtu: 'RTU Events',
  amt: 'AMT Events',
  plc: 'PLC Events',
  linux: 'Linux Events',
  other: 'Other Events'
};

const VERIFICATION_STATUS = {
  all: 'All Status',
  unverified: 'Unverified',
  verified: 'Verified',
  rejected: 'Rejected'
};

export default function AdminObservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [observations, setObservations] = useState<ObservationWithUser[]>([]);
  const [filteredObservations, setFilteredObservations] = useState<ObservationWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState<{ [key: string]: UpdateStatus }>({});
  const [formStates, setFormStates] = useState<{ [key: string]: FormState }>({});
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    status: 'unverified', // Default status to unverified
    startDate: undefined,
    endDate: undefined,
    startTime: '00:00', // Default start time
    endTime: '23:59',   // Default end time
  });

  // Add filter effect
  useEffect(() => {
    if (!observations) return;

    let filtered = [...observations];

    // Filter by category
    if (filters.category !== 'all') {
      // Assuming eventHeading contains category info like "Windows: ..."
      // Adjust this logic if category is stored differently
      const categoryPrefix = EVENT_CATEGORIES[filters.category as keyof typeof EVENT_CATEGORIES]
                                .split(' ')[0].toLowerCase();
      filtered = filtered.filter(obs => 
        obs.eventHeading.toLowerCase().startsWith(categoryPrefix)
      );
    }

    // Filter by verification status
    if (filters.status !== 'all') {
      filtered = filtered.filter(obs => {
        switch (filters.status) {
          case 'unverified':
            return obs.isVerified === null;
          case 'verified':
            return obs.isVerified === true;
          case 'rejected':
            return obs.isVerified === false;
          default:
            return true;
        }
      });
    }

    // Filter by date and time range
    const startDateTime = filters.startDate 
      ? new Date(`${format(filters.startDate, 'yyyy-MM-dd')}T${filters.startTime}:00`) 
      : null;
    const endDateTime = filters.endDate 
      ? new Date(`${format(filters.endDate, 'yyyy-MM-dd')}T${filters.endTime}:59`) 
      : null;

    if (startDateTime) {
      filtered = filtered.filter(obs => 
        new Date(obs.submittedAt) >= startDateTime!
      );
    }
    if (endDateTime) {
      filtered = filtered.filter(obs => 
        new Date(obs.submittedAt) <= endDateTime!
      );
    }

    setFilteredObservations(filtered);
  }, [filters, observations]);

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
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.startDate) {
        params.append('startDate', format(filters.startDate, 'yyyy-MM-dd'));
        params.append('startTime', filters.startTime);
      }
      if (filters.endDate) {
        params.append('endDate', format(filters.endDate, 'yyyy-MM-dd'));
        params.append('endTime', filters.endTime);
      }

      const response = await fetch(`/api/observations/admin?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch events for verification');
      }
      const data: ObservationWithUser[] = await response.json();
      setObservations(data);
      // Initial filtering happens in useEffect
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch observations when filters change
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchObservations();
    }
  }, [filters, status, session]); // Re-fetch when filters change

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

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
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

      {/* Filters Section */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
        {/* Category Select */}
        <div className="space-y-1">
          <Label htmlFor="category-filter">Category</Label>
          <Select
            onValueChange={(value) => handleFilterChange('category', value)}
            value={filters.category}
          >
            <SelectTrigger id="category-filter">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_CATEGORIES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Select */}
        <div className="space-y-1">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            onValueChange={(value) => handleFilterChange('status', value)}
            value={filters.status}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Verification status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VERIFICATION_STATUS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Picker */}
        <div className="space-y-1">
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.startDate}
                onSelect={(date: Date | undefined) => handleFilterChange('startDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Start Time Input */}
        <div className="space-y-1">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={filters.startTime}
            onChange={(e) => handleFilterChange('startTime', e.target.value)}
            disabled={!filters.startDate} // Disable if no start date
          />
        </div>

        {/* End Date Picker */}
        <div className="space-y-1">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.endDate}
                onSelect={(date: Date | undefined) => handleFilterChange('endDate', date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Time Input */}
        <div className="space-y-1">
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={filters.endTime}
            onChange={(e) => handleFilterChange('endTime', e.target.value)}
            disabled={!filters.endDate} // Disable if no end date
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {filteredObservations.length === 0 && !isLoading && (
        <p>No events found matching the current filters.</p>
      )}

      <div className="space-y-4">
        {filteredObservations.map((obs) => {
          const currentStatus = updateStatus[obs._id] || { loading: false, error: null, success: null };
          const formState = formStates[obs._id] || { score: 0, notes: '' };

          return (
            <Card key={obs._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{obs.eventHeading}</CardTitle>
                  <Badge variant={
                    obs.isVerified === true ? "default" :
                    obs.isVerified === false ? "destructive" :
                    "secondary"
                  } className={cn(
                    obs.isVerified === true && "bg-green-500 hover:bg-green-600"
                  )}>
                    {
                      obs.isVerified === true ? 'Verified' :
                      obs.isVerified === false ? 'Rejected' :
                      'Unverified'
                    }
                  </Badge>
                </div>
                <CardDescription>
                  Submitted by: {obs.userId?.email || 'Unknown User'} <br />
                  <span className="text-xs text-muted-foreground">
                    {new Date(obs.submittedAt).toLocaleString()}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold text-sm">Summary:</p>
                  <p className="text-sm text-muted-foreground pl-2">{obs.eventSummary}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">Time Noted (in ELK):</p>
                  <p className="text-sm text-muted-foreground pl-2">{obs.timeNoted}</p>
                </div>

                {/* Verification Form */}
                <div className="pt-4 border-t mt-4 space-y-2">
                  <h4 className="text-md font-semibold mb-2">Verification</h4>
                  <div>
                    <Label htmlFor={`score-${obs._id}`}>Score (if correct)</Label>
                    <Input
                      id={`score-${obs._id}`}
                      type="number"
                      value={formState.score}
                      onChange={(e) => handleFormChange(obs._id, 'score', parseInt(e.target.value, 10) || 0)}
                      min="0"
                      className="w-24 mt-1"
                      disabled={currentStatus.loading || obs.isVerified !== null} // Disable if already verified/rejected or loading
                    />
                  </div>
                  <div>
                    <Label htmlFor={`notes-${obs._id}`}>Admin Notes</Label>
                    <Textarea
                      id={`notes-${obs._id}`}
                      value={formState.notes}
                      onChange={(e) => handleFormChange(obs._id, 'notes', e.target.value)}
                      placeholder="Add verification notes here..."
                      className="mt-1"
                      disabled={currentStatus.loading || obs.isVerified !== null} // Disable if already verified/rejected or loading
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
                {/* Action Buttons - Only show if unverified */}
                {obs.isVerified === null && (
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
                )}
                {/* Status Messages */}
                <div className="h-6"> {/* Reserve space to prevent layout shifts */}
                  {currentStatus.error && (
                    <Badge variant="destructive" className="ml-auto">
                      <AlertCircle className="h-4 w-4 mr-1" /> Error: {currentStatus.error}
                    </Badge>
                  )}
                  {currentStatus.success && (
                    <Badge variant="default" className="ml-auto bg-green-500 hover:bg-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" /> {currentStatus.success}
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, AlertCircle } from "lucide-react";

// Define the validation schema using Zod, matching the CTF requirements
const formSchema = z.object({
  eventHeading: z.string().min(1, { message: "Event heading is required." }),
  eventSummary: z.string()
    .min(10, { message: "Event summary must be at least 10 characters." })
    .max(280, { message: "Event summary cannot exceed 280 characters (approx. 2 sentences)." }),
  timeNoted: z.string().min(1, { message: "Time noted is required (as seen in ELK)." }),
});

type FormData = z.infer<typeof formSchema>;

// Renamed component to reflect UI change, though file name remains
export function ObservationEntryForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventHeading: '',
      eventSummary: '',
      timeNoted: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (status !== 'authenticated') {
      setError("Authentication error. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Use the existing API endpoint
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit event.'); // Updated error message
      }

      setSuccess('Event submitted successfully!'); // Updated success message
      reset(); // Clear the form after successful submission
      // No redirect needed, allow multiple submissions

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading and unauthenticated states
  if (status === 'loading') {
    return <p className="text-center p-4">Loading session...</p>;
  }

  if (status !== 'authenticated') {
     router.push('/login'); // Redirect to login if not authenticated
     return <p className="text-center p-4">Redirecting to login...</p>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        {/* Updated Title and Description */}
        <CardTitle>Register Event Observation</CardTitle>
        <CardDescription>Record the event you observed in ELK here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Event Heading */}
          <div className="space-y-1.5">
            <Label htmlFor="eventHeading">Event Heading</Label>
            <Input
              id="eventHeading"
              placeholder="e.g., Potential Brute Force Attack"
              {...register("eventHeading")}
            />
            {errors.eventHeading && <p className="text-sm text-red-500">{errors.eventHeading.message}</p>}
          </div>

          {/* Event Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="eventSummary">Event Summary (max 2 sentences)</Label>
            <Textarea
              id="eventSummary"
              placeholder="Describe the observed event concisely."
              {...register("eventSummary")}
            />
            {errors.eventSummary && <p className="text-sm text-red-500">{errors.eventSummary.message}</p>}
          </div>

          {/* Time Noted */}
          <div className="space-y-1.5">
            <Label htmlFor="timeNoted">Time Noted (from ELK logs)</Label>
            <Input
              id="timeNoted"
              placeholder="e.g., 2024-04-19T10:35:12Z or 10:35 AM"
              {...register("timeNoted")}
            />
            {errors.timeNoted && <p className="text-sm text-red-500">{errors.timeNoted.message}</p>}
          </div>

          {/* Display Success/Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Submission Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Submitting...' : 'Submit Event'} {/* Updated button text */}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

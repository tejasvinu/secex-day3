'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

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
import { Terminal, Loader2, AlertCircle, Clock, CheckCircle } from "lucide-react";

const formSchema = z.object({
  eventHeading: z.string()
    .min(5, { message: "Event heading must be at least 5 characters." })
    .max(100, { message: "Event heading cannot exceed 100 characters." }),
  eventSummary: z.string()
    .min(10, { message: "Event summary must be at least 10 characters." })
    .max(500, { message: "Event summary cannot exceed 500 characters." }),
  timeNoted: z.string().min(1, { message: "Time noted is required." }),
});

type FormData = z.infer<typeof formSchema>;

export function EventEntryForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [charCount, setCharCount] = useState({ summary: 0 });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventHeading: '',
      eventSummary: '',
      timeNoted: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit event');
      }

      setSuccess('Event submitted successfully!');
      reset();
      setValue('timeNoted', format(new Date(), "yyyy-MM-dd HH:mm:ss"));
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the event');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCurrentTime = () => {
    setValue('timeNoted', format(new Date(), "yyyy-MM-dd HH:mm:ss"));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Submit Security Event</CardTitle>
        <CardDescription>
          Record your observations of security events in real-time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-700" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="eventHeading" className="text-base">
              Event Heading
            </Label>
            <Input
              {...register('eventHeading')}
              id="eventHeading"
              placeholder="Brief description of the security event"
              className={errors.eventHeading ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.eventHeading && (
              <p className="text-sm text-red-500">{errors.eventHeading.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventSummary" className="text-base">
              Event Summary
            </Label>
            <Textarea
              {...register('eventSummary')}
              id="eventSummary"
              placeholder="Detailed description of what you observed (2 sentences max)"
              className={`min-h-[100px] ${errors.eventSummary ? "border-red-500" : ""}`}
              disabled={isLoading}
              onChange={(e) => setCharCount({ ...charCount, summary: e.target.value.length })}
            />
            <div className="flex justify-between text-sm">
              <span className={charCount.summary > 500 ? "text-red-500" : "text-gray-500"}>
                {charCount.summary}/500 characters
              </span>
              {errors.eventSummary && (
                <span className="text-red-500">{errors.eventSummary.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeNoted" className="text-base">
              Time Noted
            </Label>
            <div className="flex gap-2">
              <Input
                {...register('timeNoted')}
                id="timeNoted"
                className={errors.timeNoted ? "border-red-500" : ""}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={updateCurrentTime}
                disabled={isLoading}
              >
                <Clock className="h-4 w-4 mr-1" />
                Now
              </Button>
            </div>
            {errors.timeNoted && (
              <p className="text-sm text-red-500">{errors.timeNoted.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Event'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

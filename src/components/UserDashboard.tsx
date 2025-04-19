'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Loader2, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Event {
  _id: string;
  eventHeading: string;
  eventSummary: string;
  timeNoted: string;
  isVerified: boolean | null;
  score: number;
  adminNotes?: string;
  submittedAt: string;
}

interface Stats {
  total: number;
  verified: number;
  rejected: number;
  pending: number;
  totalScore: number;
}

export default function UserDashboard({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    rejected: 0,
    pending: 0,
    totalScore: 0,
  });

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/observations?userId=${userId}`);
        if (!response.ok) {
          let errorMsg = 'Failed to fetch your submitted events';
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
          } catch (jsonError) {
            // Ignore JSON parsing error if response is not JSON
          }
          throw new Error(errorMsg);
        }
        
        const data = await response.json();
        
        // Handle both array responses and wrapped object responses
        const eventsArray = Array.isArray(data) ? data : data.observations;
        
        if (!Array.isArray(eventsArray)) {
          console.error('API response is not in the expected format:', data);
          throw new Error('Received invalid data format from server.');
        }

        setEvents(eventsArray);

        // Calculate stats
        const newStats = eventsArray.reduce((acc: Stats, event: Event) => {
          acc.total++;
          if (event.isVerified === true) {
            acc.verified++;
            acc.totalScore += event.score;
          } else if (event.isVerified === false) {
            acc.rejected++;
          } else {
            acc.pending++;
          }
          return acc;
        }, {
          total: 0,
          verified: 0,
          rejected: 0,
          pending: 0,
          totalScore: 0,
        });

        setStats(newStats);
      } catch (error: any) {
        console.error('Error fetching user submissions:', error);
        setError(error.message || 'Failed to load your submitted events. Please try again later.');
        setEvents([]);
        setStats({ total: 0, verified: 0, rejected: 0, pending: 0, totalScore: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 mx-auto text-destructive" />
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Event Dashboard</h2>
        <Link href="/submit-event">
          <Button className="flex items-center gap-2">
            <span>Submit New Event</span>
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-yellow-50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-purple-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Total Score</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalScore}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Events List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event._id} className="p-4 relative overflow-hidden">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium line-clamp-1">{event.eventHeading}</h3>
              <Badge variant={
                event.isVerified === null ? "outline" :
                event.isVerified ? "default" : "destructive"
              } className={`ml-2 shrink-0 ${
                event.isVerified === null ? "bg-gray-100" :
                event.isVerified ? "bg-green-100 text-green-800" : ""
              }`}>
                {event.isVerified === null ? "Pending" :
                 event.isVerified ? "Verified" : "Rejected"}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{event.eventSummary}</p>
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Noted at: {event.timeNoted}</p>
              <p>Submitted: {new Date(event.submittedAt).toLocaleString()}</p>
              {event.score > 0 && (
                <p className="text-green-600 font-medium">Score: {event.score}</p>
              )}
              {event.adminNotes && (
                <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                  <p className="font-medium text-xs text-gray-600">Admin Feedback:</p>
                  <p className="text-gray-600">{event.adminNotes}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Submitted</h3>
          <p className="text-gray-600 mb-4">Start submitting events to track your progress.</p>
          <Link href="/submit-event">
            <Button>Submit Your First Event</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

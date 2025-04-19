// filepath: c:\Users\tejasv\Documents\secex-day3\src\app\leaderboard\page.tsx
'use client';

import { LiveScoreboard } from "@/components/LiveScoreboard";

export default function LeaderboardPage() {
  return (
    <div className="container py-8 mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Security Observations Leaderboard</h1>
      <p className="text-center text-muted-foreground mb-8">
        See who has reported the most significant security events and accumulated the highest scores.
      </p>
      
      <div className="max-w-4xl mx-auto">
        <LiveScoreboard />
      </div>
      
      <div className="mt-8 max-w-2xl mx-auto bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
        <h2 className="font-semibold mb-2 text-foreground">How Scoring Works</h2>
        <p className="mb-2">
          Participants earn points by reporting security events observed in the system. Events are scored based on their security significance:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><span className="text-red-500 font-medium">Critical events</span>: Maximum points (DOS attacks, unauthorized access)</li>
          <li><span className="text-orange-500 font-medium">High severity events</span>: High points (login failures, port scans)</li>
          <li><span className="text-yellow-500 font-medium">Medium severity events</span>: Medium points (system restarts, config changes)</li>
          <li><span className="text-green-500 font-medium">Low severity events</span>: Minimum points (normal logins, typical activities)</li>
        </ul>
        <p className="mt-2">
          The leaderboard updates in real-time as participants submit new security observations.
        </p>
      </div>
    </div>
  );
}

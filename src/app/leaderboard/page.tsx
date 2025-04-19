'use client';

import { Shield, CheckCircle2 } from 'lucide-react';
import { LiveScoreboard } from '@/components/LiveScoreboard';
import { Card } from '@/components/ui/card';

export default function LeaderboardPage() {
  return (
    <div className="container py-8 mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            Security Observations Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Tracking verified security observations from our community
          </p>
        </div>

        <div className="mb-8">
          <LiveScoreboard />
        </div>
        
        <div className="w-full">
          <Card className="p-6 bg-card/50">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Verification Process
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                Only verified security observations are included in the leaderboard rankings.
                Each submission is reviewed by our security team to ensure:
              </p>
              <ul className="list-disc pl-4 space-y-1 mt-2">
                <li>Accuracy and validity of the reported event</li>
                <li>Appropriate severity classification</li>
                <li>No duplicate submissions</li>
                <li>Proper documentation and evidence</li>
              </ul>
              <p className="mt-2 text-xs border-t border-border/50 pt-2">
                Rankings update in real-time as new observations are verified. Submit your observations to participate!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

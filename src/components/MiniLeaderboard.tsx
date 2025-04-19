'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, Crown, Trophy, ArrowRight } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  eventCount: number;
  avatarUrl?: string;
}

export function MiniLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/observations/leaderboard');
        if (response.ok) {
          const data = await response.json();
          
          // Get top 5 leaders
          const topLeaders = data.slice(0, 5).map((entry: any, index: number) => ({
            id: entry.userId,
            name: entry.name || `Observer ${entry.userId.slice(0, 5)}`,
            score: entry.totalScore,
            rank: index + 1,
            eventCount: entry.observationCount,
            avatarUrl: entry.avatarUrl
          }));
          
          setLeaders(topLeaders);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Set sample data for demo
        setLeaders([
          { id: '1', name: 'Alice Defender', score: 250, rank: 1, eventCount: 8 },
          { id: '2', name: 'Bob Sentinel', score: 180, rank: 2, eventCount: 6 },
          { id: '3', name: 'Charlie Monitor', score: 120, rank: 3, eventCount: 4 },
          { id: '4', name: 'Dana Watcher', score: 90, rank: 4, eventCount: 3 },
          { id: '5', name: 'Eliot Scanner', score: 60, rank: 5, eventCount: 2 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Trophy className="h-4 w-4 text-amber-600" />;
    return null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-1">
            <Medal className="h-4 w-4 text-yellow-500" />
            Top Observers
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Medal className="h-4 w-4 text-yellow-500" />
            Top Verified Observers
          </div>
          <Link href="/leaderboard" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {leaders.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={entry.avatarUrl} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {entry.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {getRankIcon(entry.rank)}
                  <p className="font-medium text-sm truncate">{entry.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {entry.score} pts • {entry.eventCount} verified
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

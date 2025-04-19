'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Link from 'next/link';

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
  const [userPosition, setUserPosition] = useState<LeaderboardEntry | null>(null);

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
          
          // Find current user's position if they're not in top 5
          // This would require sending the user's ID in the request or matching based on session
          // Simplified for demo purposes
        }
      } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
          // Set sample data for demo
          setLeaders([
            { id: '1', name: 'Alice Defender', score: 450, rank: 1, eventCount: 12 },
            { id: '2', name: 'Bob Sentinel', score: 380, rank: 2, eventCount: 10 },
            { id: '3', name: 'Charlie Monitor', score: 320, rank: 3, eventCount: 9 },
            { id: '4', name: 'Dana Watcher', score: 280, rank: 4, eventCount: 8 },
            { id: '5', name: 'Eliot Scanner', score: 210, rank: 5, eventCount: 6 },
          ]);
        } finally {
          setLoading(false);
        }
      };
      
      fetchLeaderboard();
    }, []);

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
            Top Observers
          </div>
          <Link href="/leaderboard" passHref>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              Full Leaderboard
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <div key={leader.id} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold ${
                  leader.rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                  leader.rank === 2 ? 'bg-gray-300 text-gray-800' :
                  leader.rank === 3 ? 'bg-amber-600 text-amber-100' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {leader.rank}
                </div>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {leader.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {leader.name}
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-primary">
                {leader.score}
              </span>
            </div>
          ))}
          
          {userPosition && userPosition.rank > 5 && (
            <>
              <div className="border-t border-dashed border-gray-200 my-2"></div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {userPosition.rank}
                  </div>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-primary/20">
                      {userPosition.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">You</span>
                </div>
                <span className="text-sm font-mono font-semibold text-primary">
                  {userPosition.score}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

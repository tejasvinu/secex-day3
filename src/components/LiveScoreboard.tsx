'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ChevronUp, ChevronDown, Minus, Award, Zap, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ScoreboardEntry {
  id: string;
  name: string;
  score: number;
  rank: number;
  prevRank: number;
  change: 'up' | 'down' | 'same';
  eventCount: number;
  avatarUrl?: string;
}

const UPDATE_INTERVAL_MS = 5000;

export function LiveScoreboard() {
  const [scoreboard, setScoreboard] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdateTrigger, setLastUpdateTrigger] = useState(0);
  const elementRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  // Fetch initial leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/observations/leaderboard');
        if (response.ok) {
          const data = await response.json();
          const formatted = data.map((entry: any, index: number) => ({
            id: entry.userId,
            name: entry.name || `Observer ${entry.userId.slice(0, 5)}`,
            score: entry.totalScore,
            rank: index + 1,
            prevRank: index + 1,
            change: 'same' as const,
            eventCount: entry.observationCount,
            avatarUrl: entry.avatarUrl
          }));
          setScoreboard(formatted);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        // Fallback to sample data for demo
        const sampleData = generateSampleData();
        setScoreboard(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update leaderboard periodically
  useEffect(() => {
    if (loading) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch('/api/observations/leaderboard');
        if (response.ok) {
          const data = await response.json();
          
          // Update with fresh data, preserving previous ranks
          setScoreboard(prevBoard => {
            const updatedBoard = data.map((entry: any) => {
              const existingEntry = prevBoard.find(p => p.id === entry.userId);
              return {
                id: entry.userId,
                name: entry.name || `Observer ${entry.userId.slice(0, 5)}`,
                score: entry.totalScore,
                rank: 0, // Will be calculated after sorting
                prevRank: existingEntry?.rank || 0,
                change: 'same' as const,
                eventCount: entry.observationCount,
                avatarUrl: entry.avatarUrl
              };
            });

            // Sort by score and assign ranks
            updatedBoard.sort((a, b) => b.score - a.score);
            return updatedBoard.map((entry, index) => ({
              ...entry,
              rank: index + 1,
              change: entry.prevRank < index + 1 ? 'down' : 
                     entry.prevRank > index + 1 ? 'up' : 'same'
            }));
          });
        }
      } catch (error) {
        console.error('Failed to update leaderboard:', error);
        
        // For demo purposes, update scores randomly when API fails
        setScoreboard(prevBoard => {
          const updatedBoard = prevBoard.map(entry => ({
            ...entry,
            score: entry.score + Math.floor(Math.random() * 10),
            prevRank: entry.rank
          }));

          updatedBoard.sort((a, b) => b.score - a.score);

          return updatedBoard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            change: entry.prevRank < index + 1 ? 'down' : 
                   entry.prevRank > index + 1 ? 'up' : 'same'
          }));
        });
      }
      
      setLastUpdateTrigger(Date.now());
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [loading]);

  // Calculate positions after render
  const positions = useMemo(() => {
    const posMap = new Map<string, number>();
    scoreboard.forEach((entry) => {
      const element = elementRefs.current.get(entry.id);
      if (element) {
        posMap.set(entry.id, element.offsetTop);
      }
    });
    return posMap;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreboard, lastUpdateTrigger]);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-800';
    if (rank === 3) return 'bg-amber-600 text-amber-100';
    return 'bg-gray-700 text-gray-200';
  };

  const getChangeIcon = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (change === 'down') return <ChevronDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Security Observations Leaderboard
          </CardTitle>
          <CardDescription>Loading leaderboard data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
          <Shield className="h-5 w-5 text-blue-500" />
          Security Observations Leaderboard
        </CardTitle>
        <CardDescription className="text-center">
          Live updates every {UPDATE_INTERVAL_MS / 1000} seconds
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-12 px-4 py-3 bg-muted font-medium text-sm border-b">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-5 md:col-span-6">Observer</div>
          <div className="col-span-3 md:col-span-2 text-right">Score</div>
          <div className="col-span-2 text-center">Events</div>
        </div>
        
        <div className="relative" style={{ minHeight: `${scoreboard.length * 64}px` }}>
          {scoreboard.map((entry, index) => {
            const prevPos = positions.get(entry.id);
            const currentPos = index * 64; // Height of each row
            
            return (
              <div
                key={entry.id}
                ref={el => elementRefs.current.set(entry.id, el)}
                className="grid grid-cols-12 items-center px-4 py-3 border-b absolute w-full transition-transform duration-700 ease-out hover:bg-muted/50"
                style={{
                  transform: `translateY(${currentPos}px)`,
                  zIndex: scoreboard.length - index
                }}
              >
                {/* Rank with change indicator */}
                <div className="col-span-2 flex justify-center items-center gap-1">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${getRankColor(entry.rank)}`}>
                    {entry.rank === 1 ? <Award className="h-3.5 w-3.5" /> : entry.rank}
                  </div>
                  <span className="ml-1">{getChangeIcon(entry.change)}</span>
                </div>
                
                {/* Observer name with avatar */}
                <div className="col-span-5 md:col-span-6 flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback className="text-xs bg-primary/20">
                      {entry.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium truncate">{entry.name}</span>
                </div>
                
                {/* Score */}
                <div className="col-span-3 md:col-span-2 text-right font-mono font-semibold text-primary">
                  {entry.score}
                </div>
                
                {/* Event count */}
                <div className="col-span-2 flex justify-center">
                  <Badge variant="secondary" className="h-6 px-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {entry.eventCount}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="text-center text-xs text-muted-foreground pt-4 pb-2">
        Scores are based on security event observations submitted
      </CardFooter>
    </Card>
  );
}

// Generate sample data for demo or when API fails
function generateSampleData(): ScoreboardEntry[] {
  const names = [
    'Alice Defender', 'Bob Sentinel', 'Charlie Monitor', 
    'Dana Watcher', 'Eliot Scanner', 'Fiona Protector',
    'Greg Analyst', 'Hannah Observer', 'Ivan Detector',
    'Julia Responder', 'Kai Guardian', 'Lisa Tracker'
  ];
  
  return names.map((name, index) => ({
    id: `user-${index + 1}`,
    name,
    score: Math.floor(Math.random() * 500) + 100,
    rank: 0,
    prevRank: 0,
    change: 'same' as const,
    eventCount: Math.floor(Math.random() * 20) + 1
  })).sort((a, b) => b.score - a.score).map((entry, index) => ({
    ...entry,
    rank: index + 1,
    prevRank: index + 1
  }));
}

'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Confetti from 'react-confetti';
import { ChevronUp, ChevronDown, Minus, Award, Zap, Shield, AlertTriangle, Maximize, Minimize, Medal, Trophy, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useWindowDimensions } from "@/hooks/useWindowDimensions";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState(0);  const fullscreenRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(fullscreenRef);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const setElementRef = useCallback((id: string, element: HTMLDivElement | null) => {
    if (element) {
      elementRefs.current.set(id, element);
    } else {
      elementRefs.current.delete(id);
    }
  }, []);

  const updateWithScores = useCallback((data: any[]) => {
    setScoreboard(prevBoard => {
      const updatedBoard = data.map((entry: any) => {
        const existingEntry = prevBoard.find(p => p.id === entry.userId);
        return {
          id: entry.userId,
          name: entry.name || `Observer ${entry.userId.slice(0, 5)}`,
          score: entry.totalScore,
          rank: 0,
          prevRank: existingEntry?.rank || 0,
          change: 'same' as const,
          eventCount: entry.observationCount,
          avatarUrl: entry.avatarUrl
        };
      });

      updatedBoard.sort((a: ScoreboardEntry, b: ScoreboardEntry) => b.score - a.score);
      
      const finalBoard = updatedBoard.map((entry: ScoreboardEntry, index: number) => ({
        ...entry,
        rank: index + 1,
        change: entry.prevRank === 0 ? 'same' as const :
               entry.prevRank < index + 1 ? 'down' as const : 
               entry.prevRank > index + 1 ? 'up' as const : 'same' as const
      }));

      // Check for rank 1 changes
      const currentTopPlayer = finalBoard[0];
      const previousTopPlayer = prevBoard.find(p => p.rank === 1);
      if (currentTopPlayer && (!previousTopPlayer || currentTopPlayer.id !== previousTopPlayer.id || currentTopPlayer.change === 'same')) {
        setShowConfetti(true);
        setConfettiPieces(200);
        setTimeout(() => setConfettiPieces(0), 5000);
      }

      return finalBoard;
    });
  }, []);

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
          updateWithScores(data);
        }
      } catch (error) {
        console.error('Failed to update leaderboard:', error);
        // Demo mode updates
        setScoreboard(prevBoard => {
          const updatedBoard = prevBoard.map(entry => ({
            ...entry,
            score: entry.score + Math.floor(Math.random() * 10),
            prevRank: entry.rank,
            change: 'same' as const
          }));

          updatedBoard.sort((a: ScoreboardEntry, b: ScoreboardEntry) => b.score - a.score);

          return updatedBoard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
            change: entry.prevRank < index + 1 ? 'down' as const : 
                   entry.prevRank > index + 1 ? 'up' as const : 
                   'same' as const
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
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-amber-300 text-yellow-900 shadow-lg shadow-yellow-500/20';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-200 text-gray-800 shadow-md shadow-gray-400/20';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-500 text-amber-100 shadow-md shadow-amber-700/20';
    return 'bg-gray-700 text-gray-200';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-4 w-4" />;
    if (rank === 2) return <Medal className="h-4 w-4" />;
    if (rank === 3) return <Trophy className="h-4 w-4" />;
    return rank;
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
    <div ref={fullscreenRef} className={`bg-card text-card-foreground relative ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {showConfetti && (
        <Confetti 
          numberOfPieces={confettiPieces} 
          recycle={false} 
          style={{ position: 'fixed', zIndex: 100, left: 0, top: 0 }}
          width={windowWidth}
          height={windowHeight}
        />
      )}
      <Card className={`w-full h-full flex flex-col ${isFullscreen ? 'border-0 shadow-none' : ''}`}>
        <CardHeader className="relative border-b pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold">
            <Shield className="h-6 w-6 text-blue-500" />
            Security Observations Leaderboard
          </CardTitle>
          <CardDescription className="text-center space-y-1">
            <p className="text-sm">
              Live updates every {UPDATE_INTERVAL_MS / 1000} seconds
            </p>
            <p className="text-xs text-muted-foreground">
              Showing verified security observations only
            </p>
          </CardDescription>
          <button 
            onClick={toggleFullscreen} 
            className="absolute top-3 right-3 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </CardHeader>
        
        <CardContent className={`p-0 flex-grow overflow-hidden ${isFullscreen ? 'overflow-y-auto' : ''}`}>
          {/* Sticky Header Row */}
          <div className="sticky top-0 z-10 grid grid-cols-12 px-4 py-3 bg-muted font-semibold text-sm border-b">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5 md:col-span-6">Observer</div>
            <div className="col-span-3 md:col-span-2 text-right pr-2">Score</div>
            <div className="col-span-2 text-center">Events</div>
          </div>
          
          {/* Animated Leaderboard Rows */}
          <div className="relative" style={{ minHeight: `${scoreboard.length * 68}px` }}> {/* Increased row height slightly */}
            {scoreboard.map((entry, index) => {
              const currentPos = index * 68; // Adjusted height
              
              return (
                <div
                  key={entry.id}
                  ref={el => setElementRef(entry.id, el)}
                  className={`group grid grid-cols-12 items-center px-4 py-3 border-b absolute w-full transition-all duration-700 ease-out hover:bg-muted/50 ${
                    entry.change === 'up' ? 'animate-pulse-green' : 
                    entry.change === 'down' ? 'animate-pulse-red' : ''
                  } ${entry.rank <= 3 ? 'hover:scale-[1.02]' : ''}`}
                  style={{
                    transform: `translateY(${currentPos}px)`,
                    zIndex: scoreboard.length - index,
                    background: entry.rank === 1 
                      ? 'linear-gradient(90deg, rgba(253, 224, 71, 0.15) 0%, rgba(253, 224, 71, 0.05) 50%, transparent 100%)' 
                      : entry.rank === 2 
                      ? 'linear-gradient(90deg, rgba(209, 213, 219, 0.15) 0%, rgba(209, 213, 219, 0.05) 50%, transparent 100%)' 
                      : entry.rank === 3 
                      ? 'linear-gradient(90deg, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0.05) 50%, transparent 100%)' 
                      : 'transparent'
                  }}
                >
                  {/* Rank with change indicator */}
                  <div className="col-span-2 flex justify-center items-center gap-1">
                    <div 
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${getRankColor(entry.rank)} 
                        transition-transform duration-300 group-hover:scale-110`}
                    >
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex flex-col items-center ml-1">
                      {getChangeIcon(entry.change)}
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {entry.change === 'up' ? '+' : entry.change === 'down' ? '-' : '•'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Observer name with avatar */}
                  <div className="col-span-5 md:col-span-6 flex items-center gap-3">
                    <Avatar className={`h-9 w-9 border-2 border-background shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                      entry.rank === 1 ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background' :
                      entry.rank === 2 ? 'ring-2 ring-gray-300 ring-offset-2 ring-offset-background' :
                      entry.rank === 3 ? 'ring-2 ring-amber-600 ring-offset-2 ring-offset-background' : ''
                    }`}>
                      <AvatarImage src={entry.avatarUrl} alt={entry.name} />
                      <AvatarFallback className="text-sm bg-primary/20 font-semibold">
                        {entry.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium truncate text-base">{entry.name}</span>
                      {entry.rank <= 3 && (
                        <span className="text-xs text-muted-foreground">
                          {entry.rank === 1 ? 'Leading Observer' :
                           entry.rank === 2 ? 'Runner-up' :
                           'Third Place'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="col-span-3 md:col-span-2 text-right font-mono font-bold text-lg text-primary flex items-center justify-end gap-1 pr-2">
                    <Zap className={`h-4 w-4 ${
                      entry.rank === 1 ? 'text-yellow-500' :
                      entry.rank === 2 ? 'text-gray-400' :
                      entry.rank === 3 ? 'text-amber-500' : 'text-primary/60'
                    }`} />
                    {entry.score.toLocaleString()}
                  </div>
                  
                  {/* Event count */}
                  <div className="col-span-2 flex justify-center">
                    <Badge 
                      variant={entry.rank <= 3 ? "secondary" : "outline"} 
                      className={`h-7 px-2.5 flex items-center gap-1.5 shadow-sm text-sm transition-all duration-300 group-hover:scale-105 ${
                        entry.rank <= 3 ? 'bg-primary/10' : ''
                      }`}
                    >
                      <AlertTriangle className={`h-4 w-4 ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-amber-500' : 'text-orange-500'
                      }`} />
                      {entry.eventCount}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        
        <CardFooter className="text-center text-xs text-muted-foreground pt-3 pb-3 border-t mt-auto">
          Scores reflect submitted security event observations.
        </CardFooter>
      </Card>
    </div>
  );
}

// Generate sample data for demo or when API fails
function generateSampleData(): ScoreboardEntry[] {
  const names = [
    'Alice Defender', 'Bob Sentinel', 'Charlie Monitor', 
    'Dana Watcher', 'Eliot Scanner', 'Fiona Protector',
    'Greg Analyst', 'Hannah Observer', 'Ivan Detector'
  ];
  
  return names.map((name, index) => ({
    id: `user-${index + 1}`,
    name,
    score: Math.floor(Math.random() * 300) + 50, // Lower scores for demo data
    rank: 0,
    prevRank: 0,
    change: 'same' as const,
    eventCount: Math.floor(Math.random() * 10) + 1 // Fewer events for demo
  })).sort((a, b) => b.score - a.score).map((entry, index) => ({
    ...entry,
    rank: index + 1,
    prevRank: index + 1
  }));
}

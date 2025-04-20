'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Activity, Target, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to the dashboard
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Don't render the page content if loading session or if authenticated (will redirect)
  if (status === "loading" || status === "authenticated") {
    // Optionally, return a loading indicator
    return null; 
  }

  // Render the page content only for unauthenticated users
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center px-4 py-8 bg-gradient-to-b from-background to-muted/30">
      <ShieldCheck className="h-16 w-16 text-blue-600 mb-6 animate-pulse" />
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
        OT Security Operations Center - Live Exercise
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
        Welcome to the <span className="font-semibold text-foreground">CII SECEX 2025 - Day 03</span> OT SOC Event Logging and Tracking System.
        You are participating as a SOC Analyst in a live exercise.
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mb-12 text-left">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-3">
            <Target className="h-6 w-6 mr-3 text-blue-500" />
            <h2 className="text-2xl font-semibold">Your Objective</h2>
          </div>
          <p className="text-muted-foreground">
            Monitor the provided ELK instance observing logs from a simulated Industrial Control System (ICS) environment. Your goal is to detect security events and attacks in real-time during the exercise window.
          </p>
        </div>
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <div className="flex items-center mb-3">
            <Clock className="h-6 w-6 mr-3 text-green-500" />
            <h2 className="text-2xl font-semibold">Record Your Findings</h2>
          </div>
          <p className="text-muted-foreground">
            Accurately record each observed event using the 'Submit Event' feature on this platform. Timeliness and accuracy are key. The team with the most correctly identified events wins!
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        {/* Conditionally render the Login button only if unauthenticated */}
        {status === 'unauthenticated' && (
          <Button size="lg" asChild>
            <Link href="/login">
              Analyst Login <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        )}
        <Button size="lg" variant="outline" asChild>
          <Link href="/leaderboard">
            View Live Leaderboard <Activity className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
      <p className="mt-auto pt-8 text-sm text-muted-foreground">
        Powered by the CDAC(RTSG).
      </p>
    </div>
  );
}

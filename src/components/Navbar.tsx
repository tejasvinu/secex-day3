'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, LogIn, UserPlus, BarChart2, FileText, Settings, LogOut, ShieldCheck, Edit, Trophy, Medal, Award } from 'lucide-react';

export default function Navbar() {
  const { data: session, status } = useSession();
  // @ts-ignore // Ignore specific check for custom user property
  const isAdmin = status === 'authenticated' && session?.user?.role === 'admin';
  const isParticipant = status === 'authenticated' && !isAdmin;

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">CII SecEX 2025</Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/" passHref><Button variant="ghost">Home</Button></Link>
          
          {/* Leaderboard link - always visible */}
          <Link href="/leaderboard" passHref>
            <Button variant="ghost" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Leaderboard
            </Button>
          </Link>

          {isParticipant && (
            <>
              <Link href="/dashboard" passHref><Button variant="ghost">Dashboard</Button></Link>
              <Link href="/submit-observation" passHref><Button variant="ghost">Submit Event</Button></Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link href="/admin/dashboard" passHref><Button variant="ghost">Admin Dashboard</Button></Link>
              <Link href="/admin/observations" passHref><Button variant="ghost">Verify Events</Button></Link>
              <Link href="/admin/successful-events" passHref><Button variant="ghost">Successful Events</Button></Link>
            </>
          )}

          {status === 'unauthenticated' && (
            <>
              <Link href="/login" passHref><Button variant="ghost">Login</Button></Link>
            </>
          )}

          {status === 'authenticated' && (
            <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>Logout</Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-4 py-6">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                  <Home size={18}/> Home
                </Link>
                
                {/* Leaderboard link - always visible */}
                <Link href="/leaderboard" className="flex items-center gap-2">
                  <Award size={18}/> Leaderboard
                </Link>

                {isParticipant && (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <BarChart2 size={18}/> Dashboard
                    </Link>
                    <Link href="/submit-observation" className="flex items-center gap-2">
                      <Edit size={18}/> Submit Event
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <>
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                      <ShieldCheck size={18}/> Admin Dashboard
                    </Link>
                    <Link href="/admin/observations" className="flex items-center gap-2">
                      <FileText size={18}/> Verify Events
                    </Link>
                    <Link href="/admin/successful-events" className="flex items-center gap-2">
                      <Trophy size={18}/> Successful Events
                    </Link>
                  </>
                )}

                {status === 'unauthenticated' && (
                  <>
                    <Link href="/login" className="flex items-center gap-2">
                      <LogIn size={18}/> Login
                    </Link>
                  </>
                )}

                {status === 'authenticated' && (
                  <Button 
                    variant="ghost" 
                    onClick={() => signOut({ callbackUrl: '/' })} 
                    className="flex items-center gap-2 justify-start w-full text-left"
                  >
                    <LogOut size={18}/> Logout
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

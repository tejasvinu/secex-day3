'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Import Controller
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
import { Terminal, AlertCircle, Search, Loader2 } from "lucide-react"; // Import Loader2
// Import Select components
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
// Import icons from Heroicons
import { 
  ComputerDesktopIcon, 
  ServerIcon,
  ShieldExclamationIcon,
  CpuChipIcon,
  CommandLineIcon,
  CheckCircleIcon, // Keep CheckCircleIcon
  QuestionMarkCircleIcon // Import QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";

// Define score values for each severity level
const severityScores = {
  critical: 50,   // Critical security events
  high: 30,       // High severity security events
  medium: 20,     // Medium severity security events
  low: 10,        // Low severity/routine events
  informational: 5 // Score for 'Other' or informational events
};

// Define categorized event options with icons and colors
const eventCategories = {
  windows: {
    name: "Windows Events",
    icon: ComputerDesktopIcon,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-500",
    events: [
      { value: "win_usb_connect", label: "Connecting USB portable multimedia device", score: severityScores.medium, severity: "medium" },
      { value: "win_clear_log", label: "Clearing event log", score: severityScores.high, severity: "high" },
      { value: "win_create_user", label: "Creating user account", score: severityScores.medium, severity: "medium" },
      { value: "win_delete_user", label: "Deleting user account", score: severityScores.high, severity: "high" },
      { value: "win_rdp_fail", label: "RDP login failure", score: severityScores.high, severity: "high" },
      { value: "win_rdp_success", label: "RDP login success", score: severityScores.low, severity: "low" },
    ]
  },
  rtu: {
    name: "RTU Events",
    icon: ServerIcon,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-500",
    events: [
      { value: "rtu_login_fail_pwd", label: "User login failure - wrong password", score: severityScores.high, severity: "high" },
      { value: "rtu_login_fail_user", label: "User login failure - unknown user", score: severityScores.high, severity: "high" },
      { value: "rtu_restart", label: "RTU restart", score: severityScores.medium, severity: "medium" },
      { value: "rtu_upload_config", label: "Upload configuration successfully", score: severityScores.low, severity: "low" },
      { value: "rtu_download_config", label: "Download configuration files successfully", score: severityScores.low, severity: "low" },
      { value: "rtu_manual_reset", label: "Manual Reset", score: severityScores.medium, severity: "medium" },
    ]
  },
  amt: {
    name: "AMT Events",
    icon: ShieldExclamationIcon,
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-500",
    events: [
      { value: "amt_port_scan", label: "Port Scan", score: severityScores.high, severity: "high" },
      { value: "amt_unknown_device_network", label: "Unknown Device Entered the Network", score: severityScores.high, severity: "high" },
      { value: "amt_unauth_comm", label: "Unauthorized Communication", score: severityScores.critical, severity: "critical" },
      { value: "amt_ip_mac_mismatch", label: "IP MAC Pairing Mismatch", score: severityScores.medium, severity: "medium" },
      { value: "amt_host_scan", label: "Host Scan", score: severityScores.high, severity: "high" },
      { value: "amt_suspected_flooding", label: "Suspected Flooding", score: severityScores.medium, severity: "medium" },
      { value: "amt_dos_attack", label: "DOS Attack", score: severityScores.critical, severity: "critical" },
      { value: "amt_suspicious_apdu", label: "Suspicious APDU from MTU to RTU", score: severityScores.high, severity: "high" },
      { value: "amt_unknown_device_search", label: "Unknown Device Searching for Host", score: severityScores.medium, severity: "medium" },
      { value: "amt_tcp_termination", label: "TCP Connection Termination", score: severityScores.low, severity: "low" },
      { value: "amt_no_comm", label: "No Communication", score: severityScores.medium, severity: "medium" },
    ]
  },
  plc: {
    name: "PLC Events",
    icon: CpuChipIcon,
    color: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-500",
    events: [
      { value: "plc_login_success", label: "Login successful", score: severityScores.low, severity: "low" },
      { value: "plc_login_denied", label: "Login denied", score: severityScores.high, severity: "high" },
      { value: "plc_cpu_stop", label: "Current CPU operating mode: STOP", score: severityScores.high, severity: "high" },
    ]
  },
  linux: {
    name: "Linux Events",
    icon: CommandLineIcon,
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-500",
    events: [
      { value: "linux_auth_success", label: "Authentication success", score: severityScores.low, severity: "low" },
      { value: "linux_auth_fail", label: "Authentication failure", score: severityScores.high, severity: "high" },
      { value: "linux_rm_file", label: "Removed a file/directory using 'rm' command", score: severityScores.medium, severity: "medium" },
    ]
  },
  // Add the 'Other' category
  other: {
    name: "Other Events",
    icon: QuestionMarkCircleIcon, // Use the imported icon
    color: "bg-gray-100 text-gray-800", // Neutral color
    iconColor: "text-gray-500", // Neutral icon color
    events: [
      { value: "other_event", label: "Other (Specify in summary)", score: severityScores.informational, severity: "informational" } // Define the 'Other' event
    ]
  }
};

// Flatten event options for Zod validation
const eventOptions = Object.values(eventCategories).flatMap(category => 
  category.events.map(event => ({
    value: event.value,
    label: `${category.name.split(' ')[0]}: ${event.label}`,
    score: event.score
  }))
);

// Extract just the values for Zod enum validation
const eventValues = eventOptions.map(option => option.value) as [string, ...string[]]; // Type assertion for Zod

// Define the validation schema using Zod, matching the CTF requirements
const formSchema = z.object({
  // Use z.enum for eventHeading
  eventHeading: z.enum(eventValues, { errorMap: () => ({ message: "Please select a valid event." }) }),
  eventSummary: z.string()
    .min(10, { message: "Event summary must be at least 10 characters." })
    .max(280, { message: "Event summary cannot exceed 280 characters (approx. 2 sentences)." }),
  timeNoted: z.string().min(1, { message: "Time noted is required (as seen in ELK)." }),
});

type FormData = z.infer<typeof formSchema>;

// Renamed component to reflect UI change, though file name remains
export function ObservationEntryForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | undefined>(undefined);

  const { control, handleSubmit, formState: { errors }, reset, register, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventHeading: undefined,
      eventSummary: '',
      timeNoted: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (status !== 'authenticated') {
      setError("Authentication error. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Find the selected event to potentially include score later
    const selectedEvent = eventOptions.find(opt => opt.value === data.eventHeading);
    const score = selectedEvent ? selectedEvent.score : 0; // Get score, default to 0 if not found

    // Prepare data to send (including score if needed by the API)
    const submissionData = {
      ...data,
      score: score, // Add score here if your API expects it
    };

    try {
      // Use the existing API endpoint
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send submissionData which might include the score
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit event.'); // Updated error message
      }

      setSuccess('Event submitted successfully!'); // Updated success message
      reset(); // Clear the form after successful submission
      // No redirect needed, allow multiple submissions

    } catch (err: any) {
      console.error("Submission error:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading and unauthenticated states
  if (status === 'loading') {
    return <p className="text-center p-4">Loading session...</p>;
  }

  if (status !== 'authenticated') {
     router.push('/login'); // Redirect to login if not authenticated
     return <p className="text-center p-4">Redirecting to login...</p>;
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        {/* Updated Title and Description */}
        <CardTitle>Register Event Observation</CardTitle>
        <CardDescription>Record the event you observed in ELK here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">          {/* Enhanced Event Heading Dropdown with Categories and Search */}
          <div className="space-y-1.5">
            <Label htmlFor="eventHeading">Event Heading</Label>
            <Controller
              control={control}
              name="eventHeading"
              render={({ field }) => (
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      aria-label="Select an event"
                      className={cn(
                        "w-full justify-between text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        <>
                          {(() => {
                            // Find the selected event and its category
                            for (const [categoryKey, category] of Object.entries(eventCategories)) {
                              const event = category.events.find(e => e.value === field.value);
                              if (event) {
                                const CategoryIcon = category.icon;
                                return (
                                  <div className="flex items-center gap-2">
                                    <CategoryIcon className={`h-4 w-4 ${category.iconColor}`} />
                                    <span>{`${category.name.split(' ')[0]}: ${event.label}`}</span>
                                  </div>
                                );
                              }
                            }
                            return "Select an event...";
                          })()}
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4 text-gray-400" />
                          <span>Select an event...</span>
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[400px] overflow-y-auto" align="start"> {/* Adjusted width and max-height */}
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search events..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>No events found.</CommandEmpty>
                        {Object.entries(eventCategories).map(([categoryKey, category]) => {
                          // Filter events based on search
                          const filteredEvents = searchValue 
                            ? category.events.filter(event => 
                                event.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                                category.name.toLowerCase().includes(searchValue.toLowerCase()))
                            : category.events;

                          if (filteredEvents.length === 0) return null;

                          return (
                            <CommandGroup key={categoryKey} heading={category.name} className="py-2">
                              {filteredEvents.map((event) => {
                                // Get severity class for visual indicator
                                const severityColor = 
                                  event.severity === "critical" ? "bg-red-500" :
                                  event.severity === "high" ? "bg-orange-400" :
                                  event.severity === "medium" ? "bg-yellow-300" :
                                  event.severity === "low" ? "bg-green-300" : "bg-gray-300"; // Added gray for informational/other
                                
                                return (
                                  <CommandItem
                                    key={event.value}
                                    value={event.value}
                                    onSelect={(currentValue) => {
                                      setValue("eventHeading", currentValue as any);
                                      setOpen(false);
                                      setSearchValue("");
                                    }}
                                    className="flex items-center gap-2 hover:bg-gray-100 transition-colors py-2"
                                  >
                                    <div className="flex items-center space-x-2 flex-1">
                                      <div className="flex items-center justify-center">
                                        {React.createElement(category.icon, { 
                                          className: `h-4 w-4 ${category.iconColor}` 
                                        })}
                                      </div>
                                      <div className="ml-2 flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${severityColor}`} />
                                        <span>{event.label}</span>
                                      </div>
                                    </div>
                                    {event.value === field.value && (
                                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                    )}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          );
                        })}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.eventHeading && <p className="text-sm text-red-500">{errors.eventHeading.message}</p>}
          </div>

          {/* Event Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="eventSummary">Event Summary (max 2 sentences)</Label>
            <Textarea
              id="eventSummary"
              placeholder="Describe the observed event concisely."
              {...register("eventSummary")} // Use register here
            />
            {errors.eventSummary && <p className="text-sm text-red-500">{errors.eventSummary.message}</p>}
          </div>

          {/* Time Noted */}
          <div className="space-y-1.5">
            <Label htmlFor="timeNoted">Time Noted (from ELK logs)</Label>
            <Input
              id="timeNoted"
              placeholder="e.g., 2024-04-19T10:35:12Z or 10:35 AM"
              {...register("timeNoted")} // Use register here
            />
            {errors.timeNoted && <p className="text-sm text-red-500">{errors.timeNoted.message}</p>}
          </div>

          {/* Display Success/Error Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Submission Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="bg-green-100 border-green-300 text-green-800">
              <CheckCircleIcon className="h-4 w-4 text-green-600" /> {/* Changed icon */}
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Added spinner */}
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

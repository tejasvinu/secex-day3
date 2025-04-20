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
  CheckCircleIcon, QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline";

// Define score values for each severity level (KEEP for UI indicators if needed, but not for final score)
const severityScores = {
  critical: 30,
  high: 15,
  medium: 10,
  low: 5,
  informational: 5
};

// Define score values based on event CATEGORY
const categoryScores = {
  windows: 10,
  rtu: 15, // Assuming RTU also gets 10, adjust if needed
  amt: 5,
  plc: 15,
  linux: 10,
  other: 5 // Score for 'Other' category
};


// Define categorized event options with icons and colors, using CATEGORY scores
const eventCategories = {
  windows: {
    name: "Windows Events",
    icon: ComputerDesktopIcon,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-500",
    events: [
      // Assign category score to all events in this category
      { value: "win_usb_connect", label: "Connecting USB portable multimedia device", score: categoryScores.windows, severity: "medium" },
      { value: "win_clear_log", label: "Clearing event log", score: categoryScores.windows, severity: "high" },
      { value: "win_create_user", label: "Creating user account", score: categoryScores.windows, severity: "medium" },
      { value: "win_delete_user", label: "Deleting user account", score: categoryScores.windows, severity: "high" },
      { value: "win_rdp_fail", label: "RDP login failure", score: categoryScores.windows, severity: "high" },
      { value: "win_rdp_success", label: "RDP login success", score: categoryScores.windows, severity: "low" },
      { value: "win_other", label: "Other Windows Event (Specify in summary)", score: categoryScores.windows, severity: "informational" }
    ]
  },
  rtu: {
    name: "RTU Events",
    icon: ServerIcon,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-500",
    events: [
      // Assign category score to all events in this category
      { value: "rtu_login_fail_pwd", label: "User login failure - wrong password", score: categoryScores.rtu, severity: "high" },
      { value: "rtu_login_fail_user", label: "User login failure - unknown user", score: categoryScores.rtu, severity: "high" },
      { value: "rtu_restart", label: "RTU restart", score: categoryScores.rtu, severity: "medium" },
      { value: "rtu_upload_config", label: "Upload configuration successfully", score: categoryScores.rtu, severity: "low" },
      { value: "rtu_download_config", label: "Download configuration files successfully", score: categoryScores.rtu, severity: "low" },
      { value: "rtu_manual_reset", label: "Manual Reset", score: categoryScores.rtu, severity: "medium" },
      { value: "rtu_other", label: "Other RTU Event (Specify in summary)", score: categoryScores.rtu, severity: "informational" }
    ]
  },
  amt: {
    name: "AMT Events",
    icon: ShieldExclamationIcon,
    color: "bg-red-100 text-red-800",
    iconColor: "text-red-500",
    events: [
      // Assign category score to all events in this category
      { value: "amt_port_scan", label: "Port Scan", score: categoryScores.amt, severity: "low" }, // Severity kept for UI
      { value: "amt_unknown_device_network", label: "Unknown Device Entered the Network", score: categoryScores.amt, severity: "low" },
      { value: "amt_unauth_comm", label: "Unauthorized Communication", score: categoryScores.amt, severity: "low" },
      { value: "amt_ip_mac_mismatch", label: "IP MAC Pairing Mismatch", score: categoryScores.amt, severity: "medium" },
      { value: "amt_host_scan", label: "Host Scan", score: categoryScores.amt, severity: "medium" },
      { value: "amt_suspected_flooding", label: "Suspected Flooding", score: categoryScores.amt, severity: "low" },
      { value: "amt_dos_attack", label: "DOS Attack", score: categoryScores.amt, severity: "low" },
      { value: "amt_suspicious_apdu", label: "Suspicious APDU from MTU to RTU", score: categoryScores.amt, severity: "low" },
      { value: "amt_unknown_device_search", label: "Unknown Device Searching for Host", score: categoryScores.amt, severity: "medium" },
      { value: "amt_tcp_termination", label: "TCP Connection Termination", score: categoryScores.amt, severity: "low" },
      { value: "amt_no_comm", label: "No Communication", score: categoryScores.amt, severity: "medium" },
      { value: "amt_other", label: "Other AMT Event (Specify in summary)", score: categoryScores.amt, severity: "informational" }
    ]
  },
  plc: {
    name: "PLC Events",
    icon: CpuChipIcon,
    color: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-500",
    events: [
      // Assign category score to all events in this category
      { value: "plc_login_success", label: "Login successful", score: categoryScores.plc, severity: "low" },
      { value: "plc_login_denied", label: "Login denied", score: categoryScores.plc, severity: "high" },
      { value: "plc_cpu_stop", label: "Current CPU operating mode: STOP", score: categoryScores.plc, severity: "high" },
      { value: "plc_other", label: "Other PLC Event (Specify in summary)", score: categoryScores.plc, severity: "informational" }
    ]
  },
  linux: {
    name: "Linux Events",
    icon: CommandLineIcon,
    color: "bg-yellow-100 text-yellow-800",
    iconColor: "text-yellow-500",
    events: [
      // Assign category score to all events in this category
      { value: "linux_auth_success", label: "Authentication success", score: categoryScores.linux, severity: "low" },
      { value: "linux_auth_fail", label: "Authentication failure", score: categoryScores.linux, severity: "high" },
      { value: "linux_rm_file", label: "Removed a file/directory using 'rm' command", score: categoryScores.linux, severity: "medium" },
      { value: "linux_other", label: "Other Linux Event (Specify in summary)", score: categoryScores.linux, severity: "informational" }
    ]
  },
  other: {
    name: "Other Events",
    icon: QuestionMarkCircleIcon,
    color: "bg-gray-100 text-gray-800",
    iconColor: "text-gray-500",
    events: [
      // Assign category score
      { value: "other_event", label: "Other (Specify in summary)", score: categoryScores.other, severity: "informational" }
    ]
  }
};

// Flatten event options for Zod validation (This remains the same, it just pulls the updated scores)
const eventOptions = Object.values(eventCategories).flatMap(category =>
  category.events.map(event => ({
    value: event.value,
    label: `${category.name.split(' ')[0]}: ${event.label}`,
    score: event.score // This will now be the category score
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
    // This logic remains the same, but selectedEvent.score will now hold the category score
    const selectedEvent = eventOptions.find(opt => opt.value === data.eventHeading);
    const score = selectedEvent ? selectedEvent.score : 0; // Get category score

    // Prepare data to send (including score if needed by the API)
    const submissionData = {
      ...data,
      score: score, // Add category score here
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
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="space-y-2 pb-6 border-b">
        <CardTitle className="text-2xl font-bold text-primary">Register Event Observation</CardTitle>
        <CardDescription className="text-base">
          Record security events observed in ELK logs for scoring and verification.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-6">
          {/* Success/Error Messages */}
          {error && (
            <Alert variant="destructive" className="animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="font-semibold">Submission Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 animate-in fade-in duration-300">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <AlertTitle className="font-semibold">Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Event Heading */}
          <div className="space-y-3">
            <Label htmlFor="eventHeading" className="text-base font-medium">
              Event Type
            </Label>
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
                        "w-full justify-between text-left font-normal py-5 transition-all",
                        !field.value && "text-muted-foreground",
                        errors.eventHeading && "border-red-500 focus-visible:ring-red-500"
                      )}
                    >
                      {field.value ? (
                        <>
                          {(() => {
                            for (const [categoryKey, category] of Object.entries(eventCategories)) {
                              const event = category.events.find(e => e.value === field.value);
                              if (event) {
                                const CategoryIcon = category.icon;
                                return (
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded-md ${category.color}`}>
                                      <CategoryIcon className={`h-5 w-5 ${category.iconColor}`} />
                                    </div>
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
                          <Search className="h-5 w-5 text-gray-400" />
                          <span>Select an event type...</span>
                        </div>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[--radix-popover-trigger-width] max-h-[400px] overflow-y-auto" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput 
                        placeholder="Search events..." 
                        value={searchValue}
                        onValueChange={setSearchValue}
                        className="h-11 outline-none focus-visible:ring-0 border-b" // Added outline-none and focus-visible:ring-0, added border-b for separation
                      />
                      <CommandList>
                        <CommandEmpty className="py-3 text-center text-sm">
                          No events found.
                        </CommandEmpty>
                        {Object.entries(eventCategories).map(([categoryKey, category]) => {
                          const filteredEvents = searchValue 
                            ? category.events.filter(event => 
                                event.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                                category.name.toLowerCase().includes(searchValue.toLowerCase()))
                            : category.events;

                          if (filteredEvents.length === 0) return null;

                          return (
                            <CommandGroup key={categoryKey} heading={category.name} className="py-2">
                              {filteredEvents.map((event) => {
                                const severityColor = 
                                  event.severity === "critical" ? "bg-red-500" :
                                  event.severity === "high" ? "bg-orange-400" :
                                  event.severity === "medium" ? "bg-yellow-300" :
                                  event.severity === "low" ? "bg-green-300" : "bg-gray-300";
                                
                                return (
                                  <CommandItem
                                    key={event.value}
                                    value={event.value}
                                    onSelect={(currentValue) => {
                                      setValue("eventHeading", currentValue as any);
                                      setOpen(false);
                                      setSearchValue("");
                                    }}
                                    className="flex items-center gap-2 hover:bg-gray-50 transition-colors py-3 px-4 cursor-pointer"
                                  >
                                    <div className="flex items-center space-x-3 flex-1">
                                      <div className={`p-1 rounded-md ${category.color}`}>
                                        {React.createElement(category.icon, { 
                                          className: `h-5 w-5 ${category.iconColor}` 
                                        })}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${severityColor}`} />
                                        <span className="font-medium">{event.label}</span>
                                      </div>
                                    </div>
                                    {event.value === field.value && (
                                      <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
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
            {errors.eventHeading && (
              <p className="text-sm text-red-500 animate-in fade-in duration-300">{errors.eventHeading.message}</p>
            )}
          </div>

          {/* Event Summary */}
          <div className="space-y-3">
            <Label htmlFor="eventSummary" className="text-base font-medium">Event Summary</Label>
            <Textarea
              id="eventSummary"
              placeholder="Describe what you observed in the logs (max 2 sentences)"
              className={cn(
                "min-h-[120px] resize-none transition-all",
                errors.eventSummary && "border-red-500 focus-visible:ring-red-500"
              )}
              {...register("eventSummary")}
            />
            {errors.eventSummary && (
              <p className="text-sm text-red-500 animate-in fade-in duration-300">{errors.eventSummary.message}</p>
            )}
          </div>

          {/* Time Noted */}
          <div className="space-y-3">
            <Label htmlFor="timeNoted" className="text-base font-medium">Time Noted</Label>
            <div className="flex gap-3">
              <Input
                id="timeNoted"
                placeholder="e.g., 2024-04-19T10:35:12Z"
                className={cn(
                  "flex-1 transition-all",
                  errors.timeNoted && "border-red-500 focus-visible:ring-red-500"
                )}
                {...register("timeNoted")}
              />
              <Button
                type="button"
                variant="secondary"
                className="min-w-[100px]"
                onClick={() => setValue("timeNoted", new Date().toISOString())}
              >
                Set Now
              </Button>
            </div>
            {errors.timeNoted && (
              <p className="text-sm text-red-500 animate-in fade-in duration-300">{errors.timeNoted.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 text-lg font-medium mt-6 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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

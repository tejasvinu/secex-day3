import { Types } from 'mongoose';

// Renamed from ExerciseEvent
export interface SecurityEventObservation {
  _id?: Types.ObjectId; // Optional: Mongoose will add this
  participantId: Types.ObjectId; // Link to the User model (SOC Analyst)
  eventHeading: string;
  eventSummary: string;
  timeNoted: string; // Time the analyst noted the event
  submittedAt: Date; // Timestamp of submission
  isVerified: boolean | null; // For admin/scoring verification
  score: number; // Score assigned by admin
  adminNotes?: string; // Optional feedback from admin
}

import mongoose, { Schema, Document, models, model, Types } from 'mongoose';
// Import the new interface
import { SecurityEventObservation } from '@/types/securityEventObservation';

// Define the schema based on the SecurityEventObservation interface
const ObservationSchema: Schema = new Schema({
  userId: { // Renamed from participantId to userId, represents the user who submitted
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  eventHeading: {
    type: String,
    required: [true, 'Event heading is required.'],
    trim: true,
  },
  eventSummary: {
    type: String,
    required: [true, 'Event summary is required.'],
    trim: true,
    maxlength: [280, 'Event summary should be concise (max 280 characters).'],
  },
  timeNoted: {
    type: String,
    required: [true, 'Time noted is required.'],
    trim: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  isVerified: {
    type: Boolean,
    default: null,
  },
  score: {
    type: Number,
    default: 0,
  },
  adminNotes: {
    type: String,
    trim: true,
  },
});

// Prevent mongoose from redefining the model. Use a new model name.
const ObservationModel = models.Observation || model<SecurityEventObservation & Document>('Observation', ObservationSchema);

export default ObservationModel;

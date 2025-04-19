import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb';
import { SecurityEventObservation } from '@/types/securityEventObservation';
import * as z from 'zod'; // Add zod import
import { Types } from 'mongoose'; // Add mongoose Types import

// Define the validation schema matching the form and CTF requirements
const observationSchema = z.object({
  eventHeading: z.string().min(1),
  eventSummary: z.string().min(10).max(280),
  timeNoted: z.string().min(1),
  score: z.number().default(10), // Accept score from frontend with default of 10
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  // 1. Protect the route - Ensure user is logged in (participant or admin could potentially post? Decide based on requirements)
  // For now, let's assume only participants can submit observations via this endpoint.
  if (!session || !session.user?._id || session.user.role !== 'participant') {
    return NextResponse.json({ message: 'Unauthorized: Only participants can submit observations.' }, { status: 401 });
  }

  try {
    await connectToMongoDB(); // Use the correct function name
    const body = await request.json();    // 2. Validate incoming data
    const validation = observationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid input.', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { eventHeading, eventSummary, timeNoted, score } = validation.data;
    const userId = new Types.ObjectId(session.user._id); // Use userId

    // 3. Create and save the new observation
    const newObservation = new ObservationModel({
      userId, // Use userId
      eventHeading,
      eventSummary,
      timeNoted,
      submittedAt: new Date(),
      isVerified: null,
      score: score || 10, // Use score from frontend or default to 10
    });

    await newObservation.save();

    // 4. Return success response
    const observationObject = newObservation.toObject();
    // delete observationObject.userId; // Optionally exclude userId

    return NextResponse.json({ message: 'Observation submitted successfully.', observation: observationObject }, { status: 201 });

  } catch (error: any) {
    console.error('Observation submission error:', error);
    // Handle potential DB errors
    if (error.code === 11000) {
        return NextResponse.json({ message: 'Error: Duplicate observation detected.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'An error occurred during submission.', error: error.message }, { status: 500 });
  }
}

// GET handler to fetch observations submitted by the logged-in participant
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?._id || session.user.role !== 'participant') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToMongoDB();
        const observations = await ObservationModel.find({ userId: new Types.ObjectId(session.user._id) })
                                        .sort({ submittedAt: -1 }); // Show newest first

        return NextResponse.json(observations, { status: 200 }); // Return array directly
    } catch (error: any) {
        console.error('Error fetching observations:', error);
        return NextResponse.json({ message: 'Failed to fetch observations.', error: error.message }, { status: 500 });
    }
}

// NOTE: You will likely need separate API routes for admin actions,
// e.g., /api/admin/observations (GET all), /api/admin/observations/[id] (PUT for verification/scoring)
// and /api/admin/users (GET all, PUT/DELETE for user management).
// These admin routes should check for session.user.role === 'admin'.

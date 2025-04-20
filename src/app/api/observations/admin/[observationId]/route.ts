import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Corrected import path
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb'; // Corrected import
import mongoose from 'mongoose';

interface VerifyRequestBody {
  isVerified: boolean | null; // Allow setting back to null if needed, though typically true/false
  adminNotes?: string;
}

// Define the context type explicitly for route handlers
interface RouteContext {
  params: {
    observationId: string;
  };
}


export async function PUT(
  request: Request,
  context: RouteContext // Use the defined interface here
) {
  const session = await getServerSession(authOptions);
  const { observationId } = context.params; // Access params from the context object

  // Check if user is authenticated and is an admin
  // @ts-ignore // Ignore TypeScript error for custom session property
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Validate Observation ID
  if (!observationId || !mongoose.Types.ObjectId.isValid(observationId)) {
    return NextResponse.json({ message: 'Invalid Observation ID' }, { status: 400 });
  }

  await connectToMongoDB(); // Use the correct function name

  try {
    const body: VerifyRequestBody = await request.json();

    // Basic validation for the request body
    if (typeof body.isVerified !== 'boolean' && body.isVerified !== null) {
        return NextResponse.json({ message: 'Invalid value for isVerified' }, { status: 400 });
    }

    // Fetch the observation to determine score based on heading
    const observation = await ObservationModel.findById(observationId);
    if (!observation) {
      return NextResponse.json({ message: 'Observation not found' }, { status: 404 });
    }

    let calculatedScore = 0; // Default score

    if (body.isVerified === true) {
        const heading = observation.eventHeading.toLowerCase();
        if (heading.includes('windows')) {
            calculatedScore = 10;
        } else if (heading.includes('plc')) {
            calculatedScore = 15;
        } else if (heading.includes('amt')) { // Assuming 'amt' is another category
            calculatedScore = 15;
        } else {
            calculatedScore = 10; // Default score for other verified events
        }
    } else if (body.isVerified === false) {
        calculatedScore = 0; // Score is 0 if rejected
    }
    // If isVerified is null, score remains 0 (or could retain previous score if needed)

    const updateData: { isVerified: boolean | null; score: number; adminNotes?: string } = {
        isVerified: body.isVerified,
        score: calculatedScore,
    };

    if (body.adminNotes !== undefined) {
        updateData.adminNotes = body.adminNotes.trim();
    }

    const updatedObservation = await ObservationModel.findByIdAndUpdate(
      observationId,
      { $set: updateData },
      { new: true } // Return the updated document
    );

    return NextResponse.json(updatedObservation, { status: 200 });

  } catch (error: any) {
    console.error('Error verifying observation:', error);
    // Handle potential JSON parsing errors
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

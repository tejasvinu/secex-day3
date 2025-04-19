import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions'; // Corrected import path
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb'; // Corrected import
import mongoose from 'mongoose';

interface VerifyRequestBody {
  isVerified: boolean | null; // Allow setting back to null if needed, though typically true/false
  score: number;
  adminNotes?: string;
}

export async function PUT(
  request: Request,
  { params }: { params: { observationId: string } }
) {
  const session = await getServerSession(authOptions);
  const { observationId } = params;

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
    if (typeof body.score !== 'number' || body.score < 0) { // Assuming score cannot be negative
        return NextResponse.json({ message: 'Invalid value for score' }, { status: 400 });
    }

    const updateData: Partial<VerifyRequestBody> & { adminNotes?: string } = {
        isVerified: body.isVerified,
        score: body.score,
    };

    if (body.adminNotes !== undefined) {
        updateData.adminNotes = body.adminNotes.trim();
    }

    const updatedObservation = await ObservationModel.findByIdAndUpdate(
      observationId,
      { $set: updateData },
      { new: true } // Return the updated document
    );

    if (!updatedObservation) {
      return NextResponse.json({ message: 'Observation not found' }, { status: 404 });
    }

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

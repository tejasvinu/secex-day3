import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb'; // Corrected import

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and is an admin
  // @ts-ignore // Ignore TypeScript error for custom session property
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToMongoDB(); // Use the correct function name

  try {
    // Fetch observations, optionally filter for unverified ones
    // Populate the userId field to get user details (like email or name if needed later)
    const observations = await ObservationModel.find({ isVerified: null }) // Fetch only unverified
      .populate('userId', 'email name') // Adjust fields as needed
      .sort({ submittedAt: -1 }); // Show newest first

    return NextResponse.json(observations, { status: 200 });
  } catch (error) {
    console.error('Error fetching observations for admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {};

    // Add status filter
    if (status === 'unverified') {
      query.isVerified = null;
    } else if (status === 'verified') {
      query.isVerified = true;
    } else if (status === 'rejected') {
      query.isVerified = false;
    }

    // Add date range filter
    if (startDate || endDate) {
      query.submittedAt = {};
      if (startDate) query.submittedAt.$gte = new Date(startDate);
      if (endDate) query.submittedAt.$lte = new Date(endDate);
    }

    // Category filter will be applied to eventHeading
    if (category && category !== 'all') {
      query.eventHeading = new RegExp(category, 'i');
    }

    const observations = await ObservationModel.find(query)
      .populate('userId', 'email name')
      .sort({ submittedAt: -1 });

    return NextResponse.json(observations, { status: 200 });
  } catch (error) {
    console.error('Error fetching observations for admin:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

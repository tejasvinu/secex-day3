import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb';
import { Types } from 'mongoose';

interface UserWithEvents {
  userId: string;
  email?: string;
  teamName?: string;
  successfulEvents: any[]; // Define a more specific type if needed
  totalScore: number;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToMongoDB();

  try {
    const successfulObservations = await ObservationModel.find({ isVerified: true })
      .populate({
        path: 'userId',
        select: 'email teamName'
      })
      .sort({ submittedAt: 1 }); // Sort by time to process chronologically if needed

    // Group observations by user
    const groupedByUser = successfulObservations.reduce((acc, obs) => {
      // Ensure userId exists and is populated correctly
      if (!obs.userId || typeof obs.userId !== 'object' || !('_id' in obs.userId)) {
        console.warn('Skipping observation with missing or invalid userId:', obs._id);
        return acc;
      }
      
      const user = obs.userId as { _id: Types.ObjectId, email?: string, teamName?: string };
      const userIdString = user._id.toString();

      if (!acc[userIdString]) {
        acc[userIdString] = {
          userId: userIdString,
          email: user.email,
          teamName: user.teamName,
          successfulEvents: [],
          totalScore: 0,
        };
      }

      // Add the observation details (without repeating user info)
      const { userId, ...eventDetails } = obs.toObject(); // Convert Mongoose doc to plain object
      acc[userIdString].successfulEvents.push(eventDetails);
      acc[userIdString].totalScore += obs.score || 0;

      return acc;
    }, {} as { [key: string]: UserWithEvents });

    // Convert the grouped object into an array
    const result: UserWithEvents[] = Object.values(groupedByUser);

    // Optional: Sort users by total score or team name
    result.sort((a, b) => b.totalScore - a.totalScore); // Sort by score descending

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Error fetching and grouping successful observations:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// filepath: c:\Users\tejasv\Documents\secex-day3\src\app\api\observations\leaderboard\route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb';
import { Types } from 'mongoose';

export async function GET() {
    try {
        await connectToMongoDB();

        // Aggregate observations by user and calculate total scores
        const leaderboardData = await ObservationModel.aggregate([
            {
                $group: {
                    _id: '$userId',
                    userId: { $first: '$userId' },
                    totalScore: { $sum: '$score' }, // Sum all scores for each user
                    observationCount: { $sum: 1 }, // Count observations
                    lastSubmission: { $max: '$submittedAt' } // Latest submission
                }
            },
            {
                $lookup: {
                    from: 'users', // Assuming your users collection name
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: 1,
                    totalScore: 1,
                    observationCount: 1,
                    lastSubmission: 1,
                    name: { $arrayElemAt: ['$user.name', 0] }
                }
            },
            {
                $sort: { totalScore: -1, observationCount: -1, lastSubmission: -1 }
            }
        ]);

        return NextResponse.json(leaderboardData, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching leaderboard data:', error);
        return NextResponse.json({ message: 'Failed to fetch leaderboard data.', error: error.message }, { status: 500 });
    }
}

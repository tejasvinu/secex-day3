// filepath: c:\Users\tejasv\Documents\secex-day3\src\app\api\observations\leaderboard\route.ts
import { NextResponse } from 'next/server';
import ObservationModel from '@/models/Observation';
import { connectToMongoDB } from '@/lib/mongodb';

// Public endpoint - no authentication required
export async function GET() {
    try {
        await connectToMongoDB();

        // Aggregate only verified observations by user and calculate total scores
        const leaderboardData = await ObservationModel.aggregate([
            {
                $match: {
                    isVerified: true // Only include verified observations
                }
            },
            {
                $group: {
                    _id: '$userId',
                    userId: { $first: '$userId' },
                    totalScore: { $sum: '$score' }, // Sum scores of verified observations
                    observationCount: { $sum: 1 }, // Count verified observations
                    lastSubmission: { $max: '$submittedAt' } // Latest submission
                }
            },
            {
                $lookup: {
                    from: 'users',
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
                    name: { $arrayElemAt: ['$user.name', 0] },
                    avatarUrl: { $arrayElemAt: ['$user.avatarUrl', 0] }
                }
            },
            {
                $sort: { totalScore: -1, observationCount: -1, lastSubmission: -1 }
            }
        ]);

        // Map any null/undefined names to a generic observer name and ensure non-negative scores
        const formattedData = leaderboardData
            .filter(entry => entry.totalScore > 0) // Only include entries with positive scores
            .map(entry => ({
                ...entry,
                name: entry.name || `Observer ${entry.userId.toString().slice(0, 5)}`,
                totalScore: Math.max(0, entry.totalScore), // Ensure non-negative scores
                observationCount: Math.max(0, entry.observationCount) // Ensure non-negative counts
            }));

        return NextResponse.json(formattedData, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching leaderboard data:', error);
        return NextResponse.json({ message: 'Failed to fetch leaderboard data.', error: error.message }, { status: 500 });
    }
}

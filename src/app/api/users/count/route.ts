import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import UserModel from '@/models/User'; // Assuming your user model is named User
import { connectToMongoDB } from '@/lib/mongodb'; // Corrected import

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // @ts-ignore
  if (!session || session.user?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToMongoDB(); // Use the correct function name

  try {
    const count = await UserModel.countDocuments();
    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

import NextAuth, { AuthOptions, DefaultSession, Session, User as NextAuthUser } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters'; // Import AdapterUser
import { JWT } from "next-auth/jwt";
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectToMongoDB } from '@/lib/mongodb';
import UserModel, { IUser } from '@/models/User'; // Renamed import to UserModel
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      _id?: string;
      role?: string;
    } & DefaultSession['user'];
  }

  // Augment the existing User interface from next-auth
  interface User {
    _id?: string;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    role?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectToMongoDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please provide email and password');
        }

        const user = await UserModel.findOne({ email: credentials.email }).select('+password'); // Use UserModel

        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isPasswordMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordMatch) {
          throw new Error('Invalid credentials');
        }

        // Return user object that matches the augmented User interface
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          _id: user._id.toString(),
        };
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | AdapterUser }) { // Use imported AdapterUser
      if (user) {
        // Type assertion needed because user can be AdapterUser which might not have _id/role directly
        const userWithRole = user as NextAuthUser & { _id?: string; role?: string };
        token._id = userWithRole._id;
        token.role = userWithRole.role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user._id = token._id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

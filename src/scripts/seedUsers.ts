import mongoose from 'mongoose';
import User from '../models/User.js';
import { connectToMongoDB } from '../lib/mongodb.js';

const users = [
  // Admin accounts
  {
    email: 'admin1@cdac.in',
    password: 'Admin2025!#',
    name: 'Admin User 1',
    role: 'admin'
  },
  {
    email: 'admin2@cdac.in',
    password: 'Admin2025!#',
    name: 'Admin User 2',
    role: 'admin'
  },
  // Team B001-B010
  {
    email: 'teamb001user@cdac.in',
    password: 'B001470c!#',
    name: 'Team B001 User',
    role: 'participant'
  },
  {
    email: 'teamb002user@cdac.in',
    password: 'B002498d!#',
    name: 'Team B002 User',
    role: 'participant'
  },
  {
    email: 'teamb003user@cdac.in',
    password: 'B0034a2f!#',
    name: 'Team B003 User',
    role: 'participant'
  },
  {
    email: 'teamb004user@cdac.in',
    password: 'B004492a!#',
    name: 'Team B004 User',
    role: 'participant'
  },
  {
    email: 'teamb005user@cdac.in',
    password: 'B00547f7!#',
    name: 'Team B005 User',
    role: 'participant'
  },
  {
    email: 'teamb006user@cdac.in',
    password: 'B006446e!#',
    name: 'Team B006 User',
    role: 'participant'
  },
  {
    email: 'teamb007user@cdac.in',
    password: 'B00747a2!#',
    name: 'Team B007 User',
    role: 'participant'
  },
  {
    email: 'teamb008user@cdac.in',
    password: 'B00843ff!#',
    name: 'Team B008 User',
    role: 'participant'
  },
  {
    email: 'teamb009user@cdac.in',
    password: 'B0094533!#',
    name: 'Team B009 User',
    role: 'participant'
  },
  {
    email: 'teamb010user@cdac.in',
    password: 'B01041e5!#',
    name: 'Team B010 User',
    role: 'participant'
  },
  // Team D001-D012
  {
    email: 'teamd001user@cdac.in',
    password: 'D0014ea1!#',
    name: 'Team D001 User',
    role: 'participant'
  },
  {
    email: 'teamd002user@cdac.in',
    password: 'D002443c!#',
    name: 'Team D002 User',
    role: 'participant'
  },
  {
    email: 'teamd003user@cdac.in',
    password: 'D00345a2!#',
    name: 'Team D003 User',
    role: 'participant'
  },
  {
    email: 'teamd004user@cdac.in',
    password: 'D0044710!#',
    name: 'Team D004 User',
    role: 'participant'
  },
  {
    email: 'teamd005user@cdac.in',
    password: 'D0054485!#',
    name: 'Team D005 User',
    role: 'participant'
  },
  {
    email: 'teamd006user@cdac.in',
    password: 'D0064abf!#',
    name: 'Team D006 User',
    role: 'participant'
  },
  {
    email: 'teamd007user@cdac.in',
    password: 'D0074e77!#',
    name: 'Team D007 User',
    role: 'participant'
  },
  {
    email: 'teamd008user@cdac.in',
    password: 'D008459a!#',
    name: 'Team D008 User',
    role: 'participant'
  },
  {
    email: 'teamd009user@cdac.in',
    password: 'D00946e4!#',
    name: 'Team D009 User',
    role: 'participant'
  },
  {
    email: 'teamd010user@cdac.in',
    password: 'D01046c6!#',
    name: 'Team D010 User',
    role: 'participant'
  },
  {
    email: 'teamd011user@cdac.in',
    password: 'D01141d9!#',
    name: 'Team D011 User',
    role: 'participant'
  },
  {
    email: 'teamd012user@cdac.in',
    password: 'D012454b!#',
    name: 'Team D012 User',
    role: 'participant'
  },
  // Team M001-M012
  {
    email: 'teamm001user@cdac.in',
    password: 'M0014173!#',
    name: 'Team M001 User',
    role: 'participant'
  },
  {
    email: 'teamm002user@cdac.in',
    password: 'M0024fbd!#',
    name: 'Team M002 User',
    role: 'participant'
  },
  {
    email: 'teamm003user@cdac.in',
    password: 'M0034653!#',
    name: 'Team M003 User',
    role: 'participant'
  },
  {
    email: 'teamm004user@cdac.in',
    password: 'M004416e!#',
    name: 'Team M004 User',
    role: 'participant'
  },
  {
    email: 'teamm005user@cdac.in',
    password: 'M0054bdc!#',
    name: 'Team M005 User',
    role: 'participant'
  },
  {
    email: 'teamm006user@cdac.in',
    password: 'M0064f79!#',
    name: 'Team M006 User',
    role: 'participant'
  },
  {
    email: 'teamm007user@cdac.in',
    password: 'M007443e!#',
    name: 'Team M007 User',
    role: 'participant'
  },
  {
    email: 'teamm008user@cdac.in',
    password: 'M0084dea!#',
    name: 'Team M008 User',
    role: 'participant'
  },
  {
    email: 'teamm009user@cdac.in',
    password: 'M0094235!#',
    name: 'Team M009 User',
    role: 'participant'
  },
  {
    email: 'teamm010user@cdac.in',
    password: 'M0104b9c!#',
    name: 'Team M010 User',
    role: 'participant'
  },
  {
    email: 'teamm011user@cdac.in',
    password: 'M0114d63!#',
    name: 'Team M011 User',
    role: 'participant'
  },
  {
    email: 'teamm012user@cdac.in',
    password: 'M0124d7a!#',
    name: 'Team M012 User',
    role: 'participant'
  },
  // Team K001-K011
  {
    email: 'teamk001user@cdac.in',
    password: 'K0014290!#',
    name: 'Team K001 User',
    role: 'participant'
  },
  {
    email: 'teamk002user@cdac.in',
    password: 'K0024ee0!#',
    name: 'Team K002 User',
    role: 'participant'
  },
  {
    email: 'teamk003user@cdac.in',
    password: 'K0034ee0!#',
    name: 'Team K003 User',
    role: 'participant'
  },
  {
    email: 'teamk004user@cdac.in',
    password: 'K0044983!#',
    name: 'Team K004 User',
    role: 'participant'
  },
  {
    email: 'teamk005user@cdac.in',
    password: 'K005409f!#',
    name: 'Team K005 User',
    role: 'participant'
  },
  {
    email: 'teamk006user@cdac.in',
    password: 'K0064fad!#',
    name: 'Team K006 User',
    role: 'participant'
  },
  {
    email: 'teamk007user@cdac.in',
    password: 'K0074b98!#',
    name: 'Team K007 User',
    role: 'participant'
  },
  {
    email: 'teamk008user@cdac.in',
    password: 'K008465e!#',
    name: 'Team K008 User',
    role: 'participant'
  },
  {
    email: 'teamk009user@cdac.in',
    password: 'K009448d!#',
    name: 'Team K009 User',
    role: 'participant'
  },
  {
    email: 'teamk010user@cdac.in',
    password: 'K0104c1e!#',
    name: 'Team K010 User',
    role: 'participant'
  },
  {
    email: 'teamk011user@cdac.in',
    password: 'K0114f70!#',
    name: 'Team K011 User',
    role: 'participant'
  },
  // Management User
  {
    email: 'mgmtuser@cdac.in',
    password: 'Mgmt4198!#',
    name: 'Management User',
    role: 'participant'
  }
];

async function seedUsers() {
  try {
    await connectToMongoDB();
    
    // Delete all existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Insert new users
    const createdUsers = await User.create(users);
    console.log(`Successfully seeded ${createdUsers.length} users`);

    // Log admin credentials (in development only)
    console.log('\nAdmin Credentials (for development only):');
    console.log('Admin 1:', { email: 'admin1@cdac.in', password: 'Admin2025!#' });
    console.log('Admin 2:', { email: 'admin2@cdac.in', password: 'Admin2025!#' });

  } catch (error: any) {
    console.error('Error seeding users:');
    // Log the full error object, its message, and stack if available
    console.error(error);
    if (error instanceof Error) {
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
    } else {
        console.error('Caught non-Error object:', error);
    }
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seeding
seedUsers();

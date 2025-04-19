import { connectToMongoDB } from '../lib/mongodb.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Observation from '../models/Observation.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt'; // Import bcrypt if not already

const sampleUsers = [
  // Team Users
  { name: 'Team B001 User', email: 'teamb001user@cdac.in', role: 'participant', handle: 'teamb001user', password: 'B001470c!#' },
  { name: 'Team D001 User', email: 'teamd001user@cdac.in', role: 'participant', handle: 'teamd001user', password: 'D0014ea1!#' },
  { name: 'Team M001 User', email: 'teamm001user@cdac.in', role: 'participant', handle: 'teamm001user', password: 'M0014173!#' },
  { name: 'Team K001 User', email: 'teamk001user@cdac.in', role: 'participant', handle: 'teamk001user', password: 'K0014290!#' },
  { name: 'Management User', email: 'mgmtuser@cdac.in', role: 'participant', handle: 'mgmtuser', password: 'Mgmt4198!#' }, // Assuming Management is participant for now, adjust role if needed
  { name: 'Team B002 User', email: 'teamb002user@cdac.in', role: 'participant', handle: 'teamb002user', password: 'B002498d!#' },
  { name: 'Team B003 User', email: 'teamb003user@cdac.in', role: 'participant', handle: 'teamb003user', password: 'B0034a2f!#' },
  { name: 'Team B004 User', email: 'teamb004user@cdac.in', role: 'participant', handle: 'teamb004user', password: 'B004492a!#' },
  { name: 'Team B005 User', email: 'teamb005user@cdac.in', role: 'participant', handle: 'teamb005user', password: 'B00547f7!#' },
  { name: 'Team B006 User', email: 'teamb006user@cdac.in', role: 'participant', handle: 'teamb006user', password: 'B006446e!#' },
  { name: 'Team B007 User', email: 'teamb007user@cdac.in', role: 'participant', handle: 'teamb007user', password: 'B00747a2!#' },
  { name: 'Team B008 User', email: 'teamb008user@cdac.in', role: 'participant', handle: 'teamb008user', password: 'B00843ff!#' },
  { name: 'Team B009 User', email: 'teamb009user@cdac.in', role: 'participant', handle: 'teamb009user', password: 'B0094533!#' },
  { name: 'Team B010 User', email: 'teamb010user@cdac.in', role: 'participant', handle: 'teamb010user', password: 'B01041e5!#' },
  { name: 'Team D002 User', email: 'teamd002user@cdac.in', role: 'participant', handle: 'teamd002user', password: 'D002443c!#' },
  { name: 'Team D003 User', email: 'teamd003user@cdac.in', role: 'participant', handle: 'teamd003user', password: 'D00345a2!#' },
  { name: 'Team D004 User', email: 'teamd004user@cdac.in', role: 'participant', handle: 'teamd004user', password: 'D0044710!#' },
  { name: 'Team D005 User', email: 'teamd005user@cdac.in', role: 'participant', handle: 'teamd005user', password: 'D0054485!#' },
  { name: 'Team D006 User', email: 'teamd006user@cdac.in', role: 'participant', handle: 'teamd006user', password: 'D0064abf!#' },
  { name: 'Team D007 User', email: 'teamd007user@cdac.in', role: 'participant', handle: 'teamd007user', password: 'D0074e77!#' },
  { name: 'Team D008 User', email: 'teamd008user@cdac.in', role: 'participant', handle: 'teamd008user', password: 'D008459a!#' },
  { name: 'Team D009 User', email: 'teamd009user@cdac.in', role: 'participant', handle: 'teamd009user', password: 'D00946e4!#' },
  { name: 'Team D010 User', email: 'teamd010user@cdac.in', role: 'participant', handle: 'teamd010user', password: 'D01046c6!#' },
  { name: 'Team D011 User', email: 'teamd011user@cdac.in', role: 'participant', handle: 'teamd011user', password: 'D01141d9!#' },
  { name: 'Team D012 User', email: 'teamd012user@cdac.in', role: 'participant', handle: 'teamd012user', password: 'D012454b!#' },
  { name: 'Team M002 User', email: 'teamm002user@cdac.in', role: 'participant', handle: 'teamm002user', password: 'M0024fbd!#' },
  { name: 'Team M003 User', email: 'teamm003user@cdac.in', role: 'participant', handle: 'teamm003user', password: 'M0034653!#' },
  { name: 'Team M004 User', email: 'teamm004user@cdac.in', role: 'participant', handle: 'teamm004user', password: 'M004416e!#' },
  { name: 'Team M005 User', email: 'teamm005user@cdac.in', role: 'participant', handle: 'teamm005user', password: 'M0054bdc!#' },
  { name: 'Team M006 User', email: 'teamm006user@cdac.in', role: 'participant', handle: 'teamm006user', password: 'M0064f79!#' },
  { name: 'Team M007 User', email: 'teamm007user@cdac.in', role: 'participant', handle: 'teamm007user', password: 'M007443e!#' },
  { name: 'Team M008 User', email: 'teamm008user@cdac.in', role: 'participant', handle: 'teamm008user', password: 'M0084dea!#' },
  { name: 'Team M009 User', email: 'teamm009user@cdac.in', role: 'participant', handle: 'teamm009user', password: 'M0094235!#' },
  { name: 'Team M010 User', email: 'teamm010user@cdac.in', role: 'participant', handle: 'teamm010user', password: 'M0104b9c!#' },
  { name: 'Team M011 User', email: 'teamm011user@cdac.in', role: 'participant', handle: 'teamm011user', password: 'M0114d63!#' },
  { name: 'Team M012 User', email: 'teamm012user@cdac.in', role: 'participant', handle: 'teamm012user', password: 'M0124d7a!#' },
  { name: 'Team K002 User', email: 'teamk002user@cdac.in', role: 'participant', handle: 'teamk002user', password: 'K0024ee0!#' },
  { name: 'Team K003 User', email: 'teamk003user@cdac.in', role: 'participant', handle: 'teamk003user', password: 'K0034ee0!#' },
  { name: 'Team K004 User', email: 'teamk004user@cdac.in', role: 'participant', handle: 'teamk004user', password: 'K0044983!#' },
  { name: 'Team K005 User', email: 'teamk005user@cdac.in', role: 'participant', handle: 'teamk005user', password: 'K005409f!#' },
  { name: 'Team K006 User', email: 'teamk006user@cdac.in', role: 'participant', handle: 'teamk006user', password: 'K0064fad!#' },
  { name: 'Team K007 User', email: 'teamk007user@cdac.in', role: 'participant', handle: 'teamk007user', password: 'K0074b98!#' },
  { name: 'Team K008 User', email: 'teamk008user@cdac.in', role: 'participant', handle: 'teamk008user', password: 'K008465e!#' },
  { name: 'Team K009 User', email: 'teamk009user@cdac.in', role: 'participant', handle: 'teamk009user', password: 'K009448d!#' },
  { name: 'Team K010 User', email: 'teamk010user@cdac.in', role: 'participant', handle: 'teamk010user', password: 'K0104c1e!#' },
  { name: 'Team K011 User', email: 'teamk011user@cdac.in', role: 'participant', handle: 'teamk011user', password: 'K0114f70!#' },
  // Admin Users
  { name: 'Admin One', email: 'admin1@cdac.in', role: 'admin', handle: 'admin1', password: 'AdminPassword1!#' }, // Replace with a strong, unique password
  { name: 'Admin Two', email: 'admin2@cdac.in', role: 'admin', handle: 'admin2', password: 'AdminPassword2!#' }, // Replace with a strong, unique password
];

const sampleEvents = [
  {
    eventHeading: 'Suspicious Email Received',
    eventSummary: 'Received a phishing email attempting to collect login credentials',
    timeNoted: '2025-04-18T10:00:00Z',
  },
  {
    eventHeading: 'Unusual Network Activity',
    eventSummary: 'Detected unusual outbound traffic from workstation',
    timeNoted: '2025-04-18T11:30:00Z',
  },
];

const sampleObservations = [
  {
    observationTitle: 'System Performance Degradation',
    observationDetails: 'Multiple workstations experiencing slowdown',
    priority: 'medium',
    timeObserved: '2025-04-18T09:00:00Z',
  },
  {
    observationTitle: 'Failed Login Attempts',
    observationDetails: 'Multiple failed login attempts detected from external IPs',
    priority: 'high',
    timeObserved: '2025-04-18T10:15:00Z',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await connectToMongoDB();
    console.log('✅ Connected to MongoDB');

    // Clear existing data - ONLY USERS
    console.log('🗑️ Clearing existing user data...');
    await User.deleteMany({});
    console.log('📦 Cleared existing user data');

    // Seed users
    console.log('👤 Seeding users...');
    let createdUsers;
    try {
      // Hash passwords manually before insertion if pre-save hook is suspected
      // const usersWithHashedPasswords = await Promise.all(sampleUsers.map(async (user) => {
      //   if (user.password) {
      //     const salt = await bcrypt.genSalt(10);
      //     user.password = await bcrypt.hash(user.password, salt);
      //   }
      //   return user;
      // }));
      // createdUsers = await User.insertMany(usersWithHashedPasswords); // Use insertMany if hashing manually

      // Use insertMany instead of create
      createdUsers = await User.insertMany(sampleUsers, { ordered: false }); // Use insertMany, ordered: false allows continuing if one document fails
      console.log(`👥 Attempted to insert ${sampleUsers.length} users. Result count: ${createdUsers.length}`);
    } catch (userCreationError) {
      console.error('❌ Error during user insertion (insertMany):', userCreationError);
      // Log specific details if it's a bulk write error
      if (userCreationError.name === 'MongoBulkWriteError' && userCreationError.writeErrors) {
        userCreationError.writeErrors.forEach(err => {
          console.error(`  - Error Code: ${err.code}, Message: ${err.errmsg}`);
        });
      }
      // Optionally re-throw or handle differently
      throw userCreationError; // Re-throw to be caught by the outer catch
    }


    // // Seed events (Optional - currently commented out)
    // console.log('📝 Seeding events...');
    // const eventsWithUsers = sampleEvents.map(event => ({
    //   ...event,
    //   participantId: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
    // }));
    // const createdEvents = await Event.create(eventsWithUsers);
    // console.log(`📝 Created ${createdEvents.length} events`);

    // // Seed observations (Optional - currently commented out)
    // console.log('👁️ Seeding observations...');
    // const observationsWithUsers = sampleObservations.map(obs => ({
    //   ...obs,
    //   observerId: createdUsers[Math.floor(Math.random() * createdUsers.length)]._id,
    // }));
    // const createdObservations = await Observation.create(observationsWithUsers);
    // console.log(`👁️ Created ${createdObservations.length} observations`);

    console.log('✅ User seeding completed successfully!');

  } catch (error) {
    // Log the specific error object
    console.error('❌ Error seeding database:', error);
    // Log additional details if available
    if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    }
  } finally {
    // Close the database connection
    console.log('🚪 Closing database connection...');
    await mongoose.disconnect();
    console.log('📡 Database connection closed');
  }
}

// Run the seed function
seedDatabase();

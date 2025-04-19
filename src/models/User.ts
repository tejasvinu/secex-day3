import mongoose, { Schema, Document, models, model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string; // Make password optional as it might not always be selected
  name?: string;
  role: 'participant' | 'admin'; // Add role field
  // Add other fields as needed
}

const UserSchema: Schema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    match: [/.+\\@.+\\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
  },
  teamName: { // Add teamName field
    type: String,
    trim: true,
    // required: [true, 'Team name is required.'], // Optional: Make it required if every user must belong to a team
  },
  role: {
    type: String,
    enum: ['participant', 'admin'],
    default: 'participant',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* // Temporarily comment out the pre-save hook for debugging
// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) { // Use 'any' or a more specific error type if possible
    return next(err);
  }
});
*/

// Method to compare password for login
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    // Need to fetch the user with the password field explicitly selected
    const user = await UserModel.findById(this._id).select('+password').exec();
    if (!user || !user.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, user.password);
};


// Prevent mongoose from redefining the model.
const UserModel = models.User || model<IUser>('User', UserSchema);

export default UserModel;

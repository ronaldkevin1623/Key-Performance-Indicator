
import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// TypeScript Interface for User document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'employee';
  company: mongoose.Types.ObjectId;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't return password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    role: {
      type: String,
      enum: {
        values: ['admin', 'employee'],
        message: 'Role must be either admin or employee',
      },
      default: 'employee',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number'],
    },
    department: {
      type: String,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    position: {
      type: String,
      trim: true,
      maxlength: [100, 'Position title cannot exceed 100 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
    {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { 
      virtuals: true,
      transform: function(_doc, ret) {
        // Remove password from JSON output
        const { password, ...userWithoutPassword } = ret;
        return userWithoutPassword;
      }
    },
    toObject: { virtuals: true },
  }

);

// Indexes for better query performance
userSchema.index({ company: 1, role: 1 });
userSchema.index({ email: 1, company: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method: Compare password for login
userSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

// Instance method: Get full name
userSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Virtual field for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Static method: Find users by company
userSchema.statics.findByCompany = function(companyId: mongoose.Types.ObjectId) {
  return this.find({ company: companyId, isActive: true });
};

// Static method: Find admins by company
userSchema.statics.findAdminsByCompany = function(companyId: mongoose.Types.ObjectId) {
  return this.find({ company: companyId, role: 'admin', isActive: true });
};

// Static method: Find employees by company
userSchema.statics.findEmployeesByCompany = function(companyId: mongoose.Types.ObjectId) {
  return this.find({ company: companyId, role: 'employee', isActive: true });
};

// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
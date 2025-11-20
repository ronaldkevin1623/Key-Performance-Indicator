/**
 * Company Model
 * Represents organizations using the KPI Manager
 * 
 * Location: server/src/models/Company.model.ts
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface for Company document
export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  website?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  industry?: string;
  logo?: string;
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    status: 'active' | 'inactive' | 'trial' | 'suspended';
    startDate: Date;
    endDate?: Date;
    maxEmployees: number;
    maxProjects: number;
  };
  settings: {
    kpiCalculationMethod: 'weighted' | 'simple' | 'custom';
    taskCompletionWeight: number;
    onTimeWeight: number;
    timezone: string;
    workingHours: {
      start: string;
      end: string;
    };
  };
  zohoCliq?: {
    enabled: boolean;
    webhookUrl?: string;
    botToken?: string;
    channelId?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Company Schema
const companySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
        'Please provide a valid URL',
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-()]+$/, 'Please provide a valid phone number'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zipCode: { type: String, trim: true },
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry name cannot exceed 100 characters'],
    },
    logo: {
      type: String,
      default: null,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'basic', 'premium', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'inactive', 'trial', 'suspended'],
        default: 'trial',
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
      },
      maxEmployees: {
        type: Number,
        default: 10, // Free tier default
      },
      maxProjects: {
        type: Number,
        default: 5, // Free tier default
      },
    },
    settings: {
      kpiCalculationMethod: {
        type: String,
        enum: ['weighted', 'simple', 'custom'],
        default: 'weighted',
      },
      taskCompletionWeight: {
        type: Number,
        default: 70, // 70% weight for task completion
        min: 0,
        max: 100,
      },
      onTimeWeight: {
        type: Number,
        default: 30, // 30% weight for on-time completion
        min: 0,
        max: 100,
      },
      timezone: {
        type: String,
        default: 'Asia/Kolkata',
      },
      workingHours: {
        start: {
          type: String,
          default: '09:00',
        },
        end: {
          type: String,
          default: '18:00',
        },
      },
    },
    zohoCliq: {
      enabled: {
        type: Boolean,
        default: false,
      },
      webhookUrl: {
        type: String,
        trim: true,
      },
      botToken: {
        type: String,
        trim: true,
        select: false, // Don't return in queries by default
      },
      channelId: {
        type: String,
        trim: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
companySchema.index({ email: 1 });
companySchema.index({ isActive: 1 });
companySchema.index({ 'subscription.status': 1 });

// Virtual field: Get total employees
companySchema.virtual('employeeCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'company',
  count: true,
  match: { role: 'employee', isActive: true },
});

// Virtual field: Get total projects
companySchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'company',
  count: true,
  match: { isActive: true },
});

// Static method: Check if company can add more employees
companySchema.statics.canAddEmployee = async function(companyId: mongoose.Types.ObjectId) {
  const company = await this.findById(companyId).populate('employeeCount');
  if (!company) return false;
  
  const currentEmployees = (company as any).employeeCount || 0;
  return currentEmployees < company.subscription.maxEmployees;
};

// Static method: Check if company can add more projects
companySchema.statics.canAddProject = async function(companyId: mongoose.Types.ObjectId) {
  const company = await this.findById(companyId).populate('projectCount');
  if (!company) return false;
  
  const currentProjects = (company as any).projectCount || 0;
  return currentProjects < company.subscription.maxProjects;
};

// Instance method: Check if subscription is active
companySchema.methods.hasActiveSubscription = function(): boolean {
  return this.subscription.status === 'active' || this.subscription.status === 'trial';
};

// Pre-save middleware: Validate KPI weight totals
companySchema.pre('save', function(next) {
  const totalWeight = this.settings.taskCompletionWeight + this.settings.onTimeWeight;
  if (totalWeight !== 100) {
    return next(new Error('Task completion weight and on-time weight must total 100%'));
  }
  next();
});

// Create and export the Company model
const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);

export default Company;
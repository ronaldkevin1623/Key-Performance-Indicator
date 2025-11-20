
import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface for Project document
export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  company: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  budget?: number;
  tags?: string[];
  color?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  taskCount?: number;
  completedTaskCount?: number;
}

// Project Schema
const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required'],
      index: true,
    },
    teamMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
        message: 'Invalid project status',
      },
      default: 'planning',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Invalid priority level',
      },
      default: 'medium',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: IProject, value: Date) {
          return !value || value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    budget: {
      type: Number,
      min: [0, 'Budget cannot be negative'],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    color: {
      type: String,
      default: '#3B82F6',
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
projectSchema.index({ company: 1, status: 1 });
projectSchema.index({ company: 1, isActive: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ teamMembers: 1 });
projectSchema.index({ status: 1, priority: 1 });

// Virtual field: Get task count
projectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

// Virtual field: Get completed task count
projectSchema.virtual('completedTaskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true,
  match: { status: 'completed' },
});

// Virtual field: Calculate progress percentage
projectSchema.virtual('progress').get(function(this: IProject) {
  if (!this.taskCount || this.taskCount === 0) return 0;
  return Math.round(((this.completedTaskCount || 0) / this.taskCount) * 100);
});

// Virtual field: Check if project is overdue
projectSchema.virtual('isOverdue').get(function(this: IProject) {
  if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.endDate;
});

// Virtual field: Days remaining
projectSchema.virtual('daysRemaining').get(function(this: IProject) {
  if (!this.endDate || this.status === 'completed' || this.status === 'cancelled') {
    return null;
  }
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Static method: Find projects by company
projectSchema.statics.findByCompany = function(companyId: mongoose.Types.ObjectId) {
  return this.find({ company: companyId, isActive: true })
    .populate('createdBy', 'firstName lastName email')
    .populate('teamMembers', 'firstName lastName email avatar');
};

// Static method: Find active projects
projectSchema.statics.findActiveProjects = function(companyId: mongoose.Types.ObjectId) {
  return this.find({ 
    company: companyId, 
    status: 'active', 
    isActive: true 
  });
};

// Static method: Find projects by team member
projectSchema.statics.findByTeamMember = function(userId: mongoose.Types.ObjectId) {
  return this.find({ 
    teamMembers: userId, 
    isActive: true 
  })
    .populate('company', 'name')
    .populate('createdBy', 'firstName lastName');
};

// Instance method: Add team member
projectSchema.methods.addTeamMember = function(this: IProject, userId: mongoose.Types.ObjectId) {
  if (!this.teamMembers.includes(userId)) {
    this.teamMembers.push(userId);
  }
  return this.save();
};

// Instance method: Remove team member
projectSchema.methods.removeTeamMember = function(this: IProject, userId: mongoose.Types.ObjectId) {
  this.teamMembers = this.teamMembers.filter(
    (memberId: mongoose.Types.ObjectId) => memberId.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method: Mark as completed
projectSchema.methods.markAsCompleted = function(this: IProject) {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Pre-save middleware: Set completedAt when status changes to completed
projectSchema.pre('save', function(this: IProject, next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Create and export the Project model
const Project: Model<IProject> = mongoose.model<IProject>('Project', projectSchema);

export default Project;
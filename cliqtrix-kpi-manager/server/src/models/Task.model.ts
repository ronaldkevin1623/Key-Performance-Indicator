
import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScript Interface for Task document
export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'in-progress' | 'review' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  points: number;
  dueDate?: Date;
  startDate?: Date;
  completedDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags?: string[];
  attachments?: string[];
  comments?: Array<{
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Task Schema
const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [300, 'Task title cannot exceed 300 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [3000, 'Description cannot exceed 3000 characters'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned user is required'],
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigner reference is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'review', 'completed', 'cancelled'],
        message: 'Invalid task status',
      },
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Invalid priority level',
      },
      default: 'medium',
      index: true,
    },
    points: {
      type: Number,
      required: [true, 'KPI points are required'],
      min: [1, 'Points must be at least 1'],
      max: [1000, 'Points cannot exceed 1000'],
      default: 10,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours cannot be negative'],
    },
    actualHours: {
      type: Number,
      min: [0, 'Actual hours cannot be negative'],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    attachments: [
      {
        type: String,
        trim: true,
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [1000, 'Comment cannot exceed 1000 characters'],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
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
taskSchema.index({ company: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ assignedTo: 1, completedDate: 1 });

// Virtual field: Check if task is overdue
taskSchema.virtual('isOverdue').get(function(this: ITask) {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return new Date() > this.dueDate;
});

// Virtual field: Check if completed on time
taskSchema.virtual('isCompletedOnTime').get(function(this: ITask) {
  if (!this.completedDate || !this.dueDate || this.status !== 'completed') {
    return null;
  }
  return this.completedDate <= this.dueDate;
});

// Virtual field: Days until due
taskSchema.virtual('daysUntilDue').get(function(this: ITask) {
  if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
    return null;
  }
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual field: Calculate efficiency (if actual vs estimated hours available)
taskSchema.virtual('efficiency').get(function(this: ITask) {
  if (!this.estimatedHours || !this.actualHours || this.actualHours === 0) {
    return null;
  }
  return Math.round((this.estimatedHours / this.actualHours) * 100);
});

// Static method: Find tasks by employee
taskSchema.statics.findByEmployee = function(userId: mongoose.Types.ObjectId) {
  return this.find({ assignedTo: userId, isActive: true })
    .populate('project', 'name color')
    .populate('assignedBy', 'firstName lastName')
    .sort({ dueDate: 1 });
};

// Static method: Find pending tasks
taskSchema.statics.findPendingTasks = function(userId: mongoose.Types.ObjectId) {
  return this.find({ 
    assignedTo: userId, 
    status: { $in: ['pending', 'in-progress'] },
    isActive: true 
  }).sort({ dueDate: 1 });
};

// Static method: Find completed tasks in date range
taskSchema.statics.findCompletedInRange = function(
  userId: mongoose.Types.ObjectId, 
  startDate: Date, 
  endDate: Date
) {
  return this.find({
    assignedTo: userId,
    status: 'completed',
    completedDate: { $gte: startDate, $lte: endDate },
    isActive: true,
  });
};

// Static method: Find overdue tasks
taskSchema.statics.findOverdueTasks = function(userId: mongoose.Types.ObjectId) {
  return this.find({
    assignedTo: userId,
    status: { $nin: ['completed', 'cancelled'] },
    dueDate: { $lt: new Date() },
    isActive: true,
  }).sort({ dueDate: 1 });
};

// Static method: Calculate total points for employee
taskSchema.statics.calculateTotalPoints = async function(
  userId: mongoose.Types.ObjectId,
  startDate?: Date,
  endDate?: Date
) {
  const query: any = {
    assignedTo: userId,
    status: 'completed',
    isActive: true,
  };

  if (startDate && endDate) {
    query.completedDate = { $gte: startDate, $lte: endDate };
  }

  const tasks = await this.find(query);
  return tasks.reduce((total: number, task: ITask) => total + task.points, 0);
};

// Instance method: Mark as completed
taskSchema.methods.markAsCompleted = function(this: ITask) {
  this.status = 'completed';
  this.completedDate = new Date();
  return this.save();
};

// Instance method: Add comment
taskSchema.methods.addComment = function(this: ITask, userId: mongoose.Types.ObjectId, text: string) {
  this.comments = this.comments || [];
  this.comments.push({
    user: userId,
    text: text,
    createdAt: new Date(),
  });
  return this.save();
};

// Instance method: Update status
taskSchema.methods.updateStatus = function(this: ITask, newStatus: string) {
  this.status = newStatus as ITask['status'];

  // Set dates based on status
  if (newStatus === 'in-progress' && !this.startDate) {
    this.startDate = new Date();
  }
  if (newStatus === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }

  return this.save();
};

// Pre-save middleware: Auto-set completion date
taskSchema.pre('save', function(this: ITask, next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedDate) {
      this.completedDate = new Date();
    }
    if (this.status === 'in-progress' && !this.startDate) {
      this.startDate = new Date();
    }
  }
  next();
});

// Create and export the Task model
const Task: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default Task;
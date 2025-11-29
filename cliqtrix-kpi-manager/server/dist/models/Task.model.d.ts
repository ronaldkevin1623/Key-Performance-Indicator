import mongoose, { Document, Model } from 'mongoose';
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
    endTime?: Date;
    graceTime?: Date;
    estimatedHours?: number;
    actualHours?: number;
    tags?: string[];
    attachments?: string[];
    comments?: Array<{
        user: mongoose.Types.ObjectId;
        text: string;
        createdAt: Date;
    }>;
    completionPercent?: number;
    completionDetails?: string;
    earnedPoints?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const Task: Model<ITask>;
export default Task;
//# sourceMappingURL=Task.model.d.ts.map
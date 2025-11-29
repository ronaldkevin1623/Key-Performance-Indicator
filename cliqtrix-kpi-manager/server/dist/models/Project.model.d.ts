import mongoose, { Document, Model } from 'mongoose';
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
declare const Project: Model<IProject>;
export default Project;
//# sourceMappingURL=Project.model.d.ts.map
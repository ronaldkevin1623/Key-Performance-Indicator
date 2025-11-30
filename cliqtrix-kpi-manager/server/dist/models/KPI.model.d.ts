/**
 * KPI Model
 * Stores and calculates KPI scores for employees
 *
 * Location: server/src/models/KPI.model.ts
 */
import mongoose, { Document, Model } from 'mongoose';
export interface IKPI extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    company: mongoose.Types.ObjectId;
    period: {
        type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
        startDate: Date;
        endDate: Date;
    };
    metrics: {
        totalTasksAssigned: number;
        totalTasksCompleted: number;
        tasksCompletedOnTime: number;
        tasksCompletedLate: number;
        totalPointsEarned: number;
        totalPossiblePoints: number;
        averageCompletionTime: number;
    };
    score: {
        completionRate: number;
        onTimeRate: number;
        overallScore: number;
        grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F';
    };
    rank: {
        position: number;
        outOf: number;
        percentile: number;
    };
    trends: {
        previousScore: number;
        scoreChange: number;
        trend: 'improving' | 'stable' | 'declining';
    };
    badges: Array<{
        name: string;
        description: string;
        earnedAt: Date;
        icon?: string;
    }>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const KPI: Model<IKPI>;
export default KPI;
//# sourceMappingURL=KPI.model.d.ts.map
/**
 * Company Model
 * Represents organizations using the KPI Manager
 *
 * Location: server/src/models/Company.model.ts
 */
import mongoose, { Document, Model } from 'mongoose';
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
declare const Company: Model<ICompany>;
export default Company;
//# sourceMappingURL=Company.model.d.ts.map
import mongoose, { Document, Model } from 'mongoose';
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
    comparePassword(candidatePassword: string): Promise<boolean>;
    getFullName(): string;
}
declare const User: Model<IUser>;
export default User;
//# sourceMappingURL=User.model.d.ts.map
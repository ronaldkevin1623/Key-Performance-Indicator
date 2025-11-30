import mongoose, { Document, Model } from "mongoose";
export interface IGoal extends Document {
    _id: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    company: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    targetPoints?: number;
    priority: number;
    status: "open" | "done";
    createdAt: Date;
    updatedAt: Date;
}
declare const Goal: Model<IGoal>;
export default Goal;
//# sourceMappingURL=Goal.model.d.ts.map
import mongoose, { Document, Model } from "mongoose";
export interface ITeam extends Document {
    project: mongoose.Types.ObjectId;
    company: mongoose.Types.ObjectId;
    name: string;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
declare const Team: Model<ITeam>;
export default Team;
//# sourceMappingURL=Team.model.d.ts.map
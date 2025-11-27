import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeam extends Document {
  project: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  name: string;
  members: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Team: Model<ITeam> = mongoose.model<ITeam>("Team", teamSchema);
export default Team;

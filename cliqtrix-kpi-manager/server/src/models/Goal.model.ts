import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGoal extends Document {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  targetPoints?: number;
  priority: number; // 1 = highest
  status: "open" | "done";
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Goal title is required"],
      trim: true,
      maxlength: [300, "Goal title cannot exceed 300 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator(this: IGoal, value: Date) {
          return !value || value >= this.startDate;
        },
        message: "End date must be after start date",
      },
    },
    targetPoints: {
      type: Number,
      min: 0,
    },
    priority: {
      type: Number,
      default: 3,
      min: 1,
      max: 5,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "done"],
      default: "open",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

goalSchema.index({ user: 1, status: 1, startDate: 1, endDate: 1 });

const Goal: Model<IGoal> = mongoose.model<IGoal>("Goal", goalSchema);

export default Goal;

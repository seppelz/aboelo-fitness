import mongoose, { Document } from 'mongoose';

// Interface für Übungsfortschritt
export interface IProgress extends Document {
  user: mongoose.Types.ObjectId;
  exercise: mongoose.Types.ObjectId;
  completed: boolean;
  aborted: boolean;
  watchDuration: number; // in Sekunden
  date: Date;
  pointsEarned: number;
  timeOfDay?: number; // Hour of day (0-23) when exercise was completed
}

// Schema für Übungsfortschritt
const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    aborted: {
      type: Boolean,
      default: false,
    },
    watchDuration: {
      type: Number, // in Sekunden
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    timeOfDay: {
      type: Number, // Hour of day (0-23)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IProgress>('Progress', progressSchema);

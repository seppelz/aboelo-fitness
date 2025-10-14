import mongoose, { Document, Schema } from 'mongoose';

// Interface for session tracking
export interface ISessionMetrics extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  exercisesViewed: string[];
  exercisesCompleted: string[];
  exercisesAborted: string[];
  pagesVisited: string[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  userAgent: string;
  screenSize: {
    width: number;
    height: number;
  };
}

// Interface for daily engagement metrics
export interface IDailyEngagement extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalSessions: number;
  totalDuration: number; // in seconds
  exercisesCompleted: number;
  uniqueMuscleGroupsTrained: string[];
  timeSpentPerMuscleGroup: mongoose.Types.Map<number>;
  userSatisfactionRating?: number; // 1-5 scale
  difficultyRating?: number; // 1-5 scale
  accessibilityIssues?: string[];
}

// Interface for retention tracking
export interface IRetentionMetrics extends Document {
  userId: mongoose.Types.ObjectId;
  registrationDate: Date;
  lastActiveDate: Date;
  totalDaysActive: number;
  consecutiveDaysActive: number;
  longestStreak: number;
  is7DayRetained: boolean;
  is30DayRetained: boolean;
  is90DayRetained: boolean;
  retentionEvents: {
    day: number;
    active: boolean;
  }[];
}

// Interface for health impact tracking
export interface IHealthImpact extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  painLevel?: number; // 1-10 scale
  mobilityRating?: number; // 1-10 scale
  energyLevel?: number; // 1-10 scale
  sleepQuality?: number; // 1-10 scale
  overallWellbeing?: number; // 1-10 scale
  specificImprovements: string[];
  concerns: string[];
  notes?: string;
}

// Schemas
const sessionMetricsSchema = new Schema<ISessionMetrics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, required: true, unique: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date },
  duration: { type: Number },
  exercisesViewed: [{ type: String }],
  exercisesCompleted: [{ type: String }],
  exercisesAborted: [{ type: String }],
  pagesVisited: [{ type: String }],
  deviceType: { 
    type: String, 
    enum: ['mobile', 'tablet', 'desktop'],
    required: true 
  },
  userAgent: { type: String, required: true },
  screenSize: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  }
}, {
  timestamps: true
});

const dailyEngagementSchema = new Schema<IDailyEngagement>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalSessions: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  exercisesCompleted: { type: Number, default: 0 },
  uniqueMuscleGroupsTrained: [{ type: String }],
  timeSpentPerMuscleGroup: { type: Map, of: Number },
  userSatisfactionRating: { type: Number, min: 1, max: 5 },
  difficultyRating: { type: Number, min: 1, max: 5 },
  accessibilityIssues: [{ type: String }]
}, {
  timestamps: true
});

const retentionMetricsSchema = new Schema<IRetentionMetrics>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  registrationDate: { type: Date, required: true },
  lastActiveDate: { type: Date, required: true },
  totalDaysActive: { type: Number, default: 0 },
  consecutiveDaysActive: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  is7DayRetained: { type: Boolean, default: false },
  is30DayRetained: { type: Boolean, default: false },
  is90DayRetained: { type: Boolean, default: false },
  retentionEvents: [{
    day: { type: Number, required: true },
    active: { type: Boolean, required: true }
  }]
}, {
  timestamps: true
});

const healthImpactSchema = new Schema<IHealthImpact>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  painLevel: { type: Number, min: 1, max: 10 },
  mobilityRating: { type: Number, min: 1, max: 10 },
  energyLevel: { type: Number, min: 1, max: 10 },
  sleepQuality: { type: Number, min: 1, max: 10 },
  overallWellbeing: { type: Number, min: 1, max: 10 },
  specificImprovements: [{ type: String }],
  concerns: [{ type: String }],
  notes: { type: String }
}, {
  timestamps: true
});

// Indexes for better query performance
sessionMetricsSchema.index({ userId: 1, startTime: -1 });
dailyEngagementSchema.index({ userId: 1, date: -1 });
// retentionMetricsSchema already has unique index on userId, no need for additional index
healthImpactSchema.index({ userId: 1, date: -1 });

// Models
export const SessionMetrics = mongoose.model<ISessionMetrics>('SessionMetrics', sessionMetricsSchema);
export const DailyEngagement = mongoose.model<IDailyEngagement>('DailyEngagement', dailyEngagementSchema);
export const RetentionMetrics = mongoose.model<IRetentionMetrics>('RetentionMetrics', retentionMetricsSchema);
export const HealthImpact = mongoose.model<IHealthImpact>('HealthImpact', healthImpactSchema); 
import mongoose, { Document, Schema } from 'mongoose';

export interface IPushSubscription extends Document {
  user: mongoose.Types.ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  expirationTime?: Date | null;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
      },
      auth: {
        type: String,
        required: true,
      },
    },
    expirationTime: {
      type: Date,
      default: null,
    },
    userAgent: {
      type: String,
      default: undefined,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

pushSubscriptionSchema.index({ user: 1, endpoint: 1 }, { unique: true });

export default mongoose.model<IPushSubscription>('PushSubscription', pushSubscriptionSchema);

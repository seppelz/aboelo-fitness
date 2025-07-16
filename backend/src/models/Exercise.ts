import mongoose, { Document } from 'mongoose';

// Interface für Übungen
export interface IExercise extends Document {
  videoId: string;          // Eindeutige ID für das Video
  title: string;            // Name der Übung
  preparation: string;      // Vorbereitung der Übung
  execution: string;        // Ausführung der Übung
  goal: string;             // Ziel der Übung
  tips: string;             // Tipps zur Durchführung
  muscleGroup: string;      // Muskelgruppe (Bauch, Beine, etc.)
  category: string;         // Kategorie (Kraft, Mobilisation)
  isSitting: boolean;       // Sitzende Übung
  usesTheraband: boolean;   // Mit Theraband
  isDynamic: boolean;       // Dynamisch oder statisch
  isUnilateral: boolean;    // Einseitig oder beidseitig
  youtubeVideoId: string;   // YouTube-Video-ID
  
  // Bisherige Felder
  difficulty?: number;      // Optional: Schwierigkeit 1-5
  duration?: number;        // Optional: Dauer in Sekunden
  thumbnailUrl?: string;    // Optional: Thumbnail-URL
  tags?: string[];          // Optional: Tags
  instructions?: string[];  // Optional: Zusätzliche Anweisungen
}

// Schema für Übungen
const exerciseSchema = new mongoose.Schema(
  {
    videoId: {
      type: String,
      required: [true, 'VideoID ist erforderlich'],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Name der Übung ist erforderlich'],
      trim: true,
    },
    preparation: {
      type: String,
      required: [true, 'Vorbereitung ist erforderlich'],
      trim: true,
    },
    execution: {
      type: String,
      required: [true, 'Ausführung ist erforderlich'],
      trim: true,
    },
    goal: {
      type: String,
      required: [true, 'Ziel ist erforderlich'],
      trim: true,
    },
    tips: {
      type: String,
      required: [true, 'Tipps sind erforderlich'],
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: [true, 'Muskelgruppe ist erforderlich'],
      enum: ['Bauch', 'Beine', 'Po', 'Schulter', 'Arme', 'Brust', 'Nacken', 'Rücken'],
    },
    category: {
      type: String,
      required: [true, 'Kategorie ist erforderlich'],
      enum: ['Kraft', 'Mobilisation'],
    },
    isSitting: {
      type: Boolean,
      required: true,
      default: false,
    },
    usesTheraband: {
      type: Boolean,
      required: true,
      default: false,
    },
    isDynamic: {
      type: Boolean,
      required: true,
      default: true,
    },
    isUnilateral: {
      type: Boolean,
      required: true,
      default: false,
    },
    youtubeVideoId: {
      type: String,
      required: [true, 'YouTube-Video-ID ist erforderlich'],
      trim: true,
    },
    
    // Optionale Felder aus dem ursprünglichen Schema
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: 1,
    },
    duration: {
      type: Number, // in Sekunden
    },
    thumbnailUrl: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    instructions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExercise>('Exercise', exerciseSchema);

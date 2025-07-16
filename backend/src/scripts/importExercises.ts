/**
 * Skript zum Importieren der Übungen aus den Textdateien in die MongoDB
 */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise';

dotenv.config();

// MongoDB-Verbindung herstellen
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://sebastiansoecker:WSdj83HqSmKrv04B@cluster0.slnc9kk.mongodb.net/aboelo-fitness?retryWrites=true&w=majority';
    console.log(`Verbindung zu MongoDB wird hergestellt: ${mongoUri}`);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB verbunden: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error(`MongoDB-Verbindungsfehler: ${error.message}`);
    process.exit(1);
  }
};

// Funktion zum Parsen der Textdateien
const parseExerciseFile = (fileContent: string, fileName: string) => {
  const exercises = [];
  const exerciseBlocks = fileContent.split('--').filter(block => block.trim() !== '');
  
  for (const block of exerciseBlocks) {
    const lines = block.trim().split('\n');
    const exercise: any = {
      // Standardwerte setzen
      difficulty: 1,
      tags: [],
      instructions: []
    };
    
    let hasRequiredFields = true;
    
    for (const line of lines) {
      if (!line.includes(':')) continue;
      
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      
      if (!value) continue; // Leere Werte überspringen
      
      switch (key.trim()) {
        case 'VideoID':
          exercise.videoId = value;
          break;
        case 'Name':
          exercise.title = value;
          break;
        case 'Vorbereitung':
          exercise.preparation = value;
          break;
        case 'Ausfuehrung':
        case 'Ausführung': // Beide Schreibweisen abdecken
          exercise.execution = value;
          break;
        case 'Ziel':
          exercise.goal = value;
          break;
        case 'Tipps':
          exercise.tips = value;
          break;
        case 'Muskelgruppe':
          // Problematische Zeichenkodierung korrigieren
          let muscleGroup = value;
          if (muscleGroup.includes('�cken')) {
            muscleGroup = 'Rücken';
          }
          exercise.muscleGroup = muscleGroup;
          break;
        case 'Kategorie':
          exercise.category = value;
          break;
        case 'IsSitzend':
          exercise.isSitting = value.toLowerCase() === 'true';
          break;
        case 'IsTheraBand':
          exercise.usesTheraband = value.toLowerCase() === 'true';
          break;
        case 'IsDynamisch':
          exercise.isDynamic = value.toLowerCase() === 'true';
          break;
        case 'IsEinseitig':
          exercise.isUnilateral = value.toLowerCase() === 'true';
          break;
        case 'Übungsvideo':
          exercise.youtubeVideoId = value;
          break;
      }
    }
    
    // Fehlende Pflichtfelder mit Platzhaltern füllen, um Import zu ermöglichen
    if (!exercise.execution) {
      console.log(`Warnung: Übung VideoID ${exercise.videoId} in ${fileName} hat keine Ausführungsbeschreibung. Setze Platzhalter.`);
      exercise.execution = exercise.preparation || 'Bitte Ausführungsbeschreibung hinzufügen';
    }
    
    if (!exercise.tips) {
      console.log(`Warnung: Übung VideoID ${exercise.videoId} in ${fileName} hat keine Tipps. Setze Platzhalter.`);
      exercise.tips = 'Achten Sie auf korrekte Körperhaltung';
    }
    
    if (!exercise.youtubeVideoId) {
      console.log(`Warnung: Übung VideoID ${exercise.videoId} in ${fileName} hat keine YouTube-Video-ID. Setze Platzhalter.`);
      exercise.youtubeVideoId = 'dQw4w9WgXcQ'; // Platzhalter-Video
    }
    
    // Pflichtfelder prüfen
    const requiredFields = ['videoId', 'title', 'preparation', 'execution', 'goal', 'tips', 'muscleGroup', 'category', 'youtubeVideoId'];
    for (const field of requiredFields) {
      if (!exercise[field]) {
        console.log(`Überspringe Übung: Fehlendes Pflichtfeld ${field} für VideoID ${exercise.videoId || 'unbekannt'} in ${fileName}`);
        hasRequiredFields = false;
        break;
      }
    }
    
    if (hasRequiredFields) {
      // Generiere Thumbnail-URL aus der YouTube-Video-ID
      exercise.thumbnailUrl = `https://img.youtube.com/vi/${exercise.youtubeVideoId}/hqdefault.jpg`;
      exercises.push(exercise);
    }
  }
  
  return exercises;
};

// Hauptfunktion zum Importieren der Übungen
const importExercises = async () => {
  try {
    // Mit MongoDB verbinden
    await connectDB();
    
    // Absoluten Pfad zu den Übungsanleitungen erstellen
    const instructionsDir = path.join('/home/sebastian/Downloads/aboelo-fitness/frontend/public/exercise-instructions');
    console.log(`Suche Übungsdateien in: ${instructionsDir}`);
    
    const files = fs.readdirSync(instructionsDir).filter(file => file.endsWith('.txt'));
    
    console.log(`${files.length} Übungsdateien gefunden.`);
    
    let totalExercises = 0;
    let importedExercises = 0;
    
    for (const file of files) {
      const filePath = path.join(instructionsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const exercises = parseExerciseFile(fileContent, file);
      
      totalExercises += exercises.length;
      console.log(`Datei ${file}: ${exercises.length} Übungen gefunden`);
      
      // Übungen in die Datenbank importieren
      for (const exercise of exercises) {
        try {
          // Überprüfen, ob Übung bereits existiert (basierend auf videoId)
          const existingExercise = await Exercise.findOne({ videoId: exercise.videoId });
          
          if (existingExercise) {
            console.log(`Übung mit VideoID ${exercise.videoId} wird aktualisiert`);
            await Exercise.findOneAndUpdate({ videoId: exercise.videoId }, exercise);
          } else {
            console.log(`Neue Übung mit VideoID ${exercise.videoId} wird erstellt`);
            await Exercise.create(exercise);
          }
          
          importedExercises++;
        } catch (error: any) {
          console.error(`Fehler beim Importieren der Übung mit VideoID ${exercise.videoId}: ${error.message}`);
        }
      }
    }
    
    console.log(`Import abgeschlossen. ${importedExercises} von ${totalExercises} Übungen wurden erfolgreich importiert.`);
    process.exit(0);
  } catch (error: any) {
    console.error(`Fehler: ${error.message}`);
    process.exit(1);
  }
};

// Starte den Import
importExercises();

/**
 * Skript zum Importieren der Übungen aus den Textdateien in die MongoDB
 */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise';

const CLOUDINARY_CLOUD_NAME = 'dtihzud16';

const VIDEO_ID_MAPPING: Record<string, string> = {
  '1': '1_qj081s',
  '2': '2_s5xqrb',
  '3': '3_zut1mi',
  '5': '5_ekyjqw',
  '6': '6_bnetzw',
  '7': '7_uyhdtj',
  '9': '9_rux8u9',
  '10': '10_i10azd',
  '11': '11_ihgw34',
  '12': '12_ykvvuo',
  '13': '13_ehgt6e',
  '15': '15_y8exbj',
  '17': '17_tppsaf',
  '20': '20_v2okek',
  '21': '21_qa0pqj',
  '22': '22_a6bpyk',
  '24': '24_rgphia',
  '25': '25_czrvvd',
  '27': '27_xvkej4',
  '28': '28_u2x6jg',
  '30': '30_lchqot',
  '31': '31_cnztct',
  '32': '32_j3mogo',
  '100': '100_qnjbdf',
  '102': '102_m9mgh2',
  '103': '103_cxvmrn',
  '105': '105_gj0kwh',
  '106': '106_oae044',
  '201': '201_xdxhlt',
  '202': '202_ecdhda',
  '204': '204_fqxhfa',
  '205': '205_aulbfd',
  '301': '301_i4iiug',
  '302': '302_a2sp2l',
  '303': '303_juen7n',
  '400': '400_dpd1pl',
  '402': '402_hx3xvt',
  '403': '403_z7atto',
  '405': '405_kcnh38',
  '406': '406_en6vg6',
  '407': '407_udrfti',
  '408': '408_aoybf9',
  '409': '409_svmaem',
  '410': '410_rv0q0g',
  '411': '411_nzs1ym',
  '500': '500_qznt6y',
  '501': '501_eohzz3',
  '502': '502_ts5srr',
  '503': '503_mvlt3v',
  '505': '505_ogukjt',
  '507': '507_yoh6ur',
  '508': '508_zggre3',
  '512': '512_metpzk',
  '513': '513_rtdxel',
  '514': '514_sg5eyp',
  '515': '515_aug5xv',
  '520': '520_onoj46',
  '521': '521_oz16wl',
  '523': '523_cbz73o',
  '550': '550_p4pyqa',
  '551': '551_ckblmp',
  '552': '552_jnzs3y'
};

dotenv.config();

// MongoDB-Verbindung herstellen
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log(`Verbindung zu MongoDB wird hergestellt...`);
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB verbunden: ${conn.connection.host}`);
    console.log(`Datenbank: ${conn.connection.name}`);
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
    
    // Pflichtfelder prüfen
    const requiredFields = ['videoId', 'title', 'preparation', 'execution', 'goal', 'tips', 'muscleGroup', 'category'];
    for (const field of requiredFields) {
      if (!exercise[field]) {
        console.log(`Überspringe Übung: Fehlendes Pflichtfeld ${field} für VideoID ${exercise.videoId || 'unbekannt'} in ${fileName}`);
        hasRequiredFields = false;
        break;
      }
    }
    
    if (hasRequiredFields) {
      if (!exercise.videoId || !VIDEO_ID_MAPPING[exercise.videoId]) {
        console.log(`Überspringe Übung: Keine Cloudinary-Zuordnung für VideoID ${exercise.videoId} in ${fileName}`);
        continue;
      }

      const cloudinaryId = VIDEO_ID_MAPPING[exercise.videoId];
      exercise.youtubeVideoId = cloudinaryId; // speichern für Konsistenz
      exercise.thumbnailUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_auto,c_pad,b_auto,w_576,h_720/${cloudinaryId}.jpg`;
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
    
    // Relativen Pfad zu den Übungsanleitungen erstellen (funktioniert auf Windows und Linux)
    const instructionsDir = path.join(__dirname, '..', '..', '..', 'frontend', 'public', 'exercise-instructions');
    console.log(`Suche Übungsdateien in: ${instructionsDir}`);
    
    const files = fs.readdirSync(instructionsDir).filter(file => file.endsWith('.txt'));
    
    console.log(`${files.length} Übungsdateien gefunden.`);
    
    let totalExercises = 0;
    let importedExercises = 0;
    const seenVideoIds = new Set<string>();
    
    for (const file of files) {
      const filePath = path.join(instructionsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const exercises = parseExerciseFile(fileContent, file);
      
      totalExercises += exercises.length;
      console.log(`Datei ${file}: ${exercises.length} Übungen gefunden`);
      
      // Übungen in die Datenbank importieren
      for (const exercise of exercises) {
        if (seenVideoIds.has(exercise.videoId)) {
          console.log(`Überspringe doppelte Übung (bereits importiert in dieser Sitzung) mit VideoID ${exercise.videoId}`);
          continue;
        }
        seenVideoIds.add(exercise.videoId);

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

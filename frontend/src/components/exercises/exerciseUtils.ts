import { Exercise } from '../../types';

// Cloudinary Konfiguration
const CLOUDINARY_CLOUD_NAME = 'dtihzud16';

// Add caching for thumbnails
const thumbnailCache = new Map<string, string>();

// Mapping von einfachen IDs zu vollständigen Dateinamen
export const VIDEO_ID_MAPPING: Record<string, string> = {
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

/**
 * Ermittelt die beste verfügbare Thumbnail-URL für eine Übung.
 * Priorität: Cloudinary-Poster > explizites Thumbnail > Platzhalter.
 */
export const getThumbnailUrl = (exercise: Exercise): string => {
  const videoId = (exercise as any).videoId || '';  
  // Check cache first
  const cacheKey = `${videoId}_${exercise.name}`;
  if (thumbnailCache.has(cacheKey)) {
    return thumbnailCache.get(cacheKey)!;
  }
  
  let thumbnailUrl: string;
  
  if (videoId && VIDEO_ID_MAPPING[videoId]) {
    const cloudinaryId = VIDEO_ID_MAPPING[videoId];
    // Erzeugt die URL für das .jpg-Poster, das von Cloudinary generiert wird.
    // c_pad mit Hintergrund statt c_fit um sicherzustellen, dass die ganze Person sichtbar ist
    thumbnailUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_auto,c_pad,b_auto,w_576,h_720/${cloudinaryId}.jpg`;
  } else {
    
    // Fallback - block YouTube URLs and create branded placeholder
    if (exercise.thumbnailUrl && !exercise.thumbnailUrl.includes('youtube') && !exercise.thumbnailUrl.includes('ytimg')) {
      thumbnailUrl = exercise.thumbnailUrl;
    } else {
      // Generate color-coded placeholder
      const muscleGroup = (exercise as any).muscleGroup || 'Allgemein';
      const muscleGroupColors: Record<string, string> = {
        'Bauch': '#ff6b6b', 'Po': '#45b7d1', 'Schulter': '#96ceb4',
        'Brust': '#fcea2b', 'Nacken': '#ff9ff3', 'Rücken': '#54a0ff', 'Allgemein': '#778ca3'
      };
      const color = muscleGroupColors[muscleGroup] || muscleGroupColors['Allgemein'];
      
      // Create a data URL for a simple colored rectangle with text (no emojis to avoid btoa encoding issues)
      thumbnailUrl = `data:image/svg+xml;base64,${btoa(`<svg width="576" height="720" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="40%" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" fill="white" font-weight="bold">${muscleGroup}</text><text x="50%" y="55%" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="white">Training</text><text x="50%" y="70%" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white">Video wird geladen...</text></svg>`)}`;
    }
  }
  
  // Cache the result
  thumbnailCache.set(cacheKey, thumbnailUrl);
  return thumbnailUrl;
};

/**
 * Ermittelt die Video-Quelldatei und das zugehörige Posterbild.
 */
export const getVideoDetails = (exercise: Exercise): { type: 'video' | 'none', source: string, poster: string } => {
  const videoId = (exercise as any).videoId || '';
  const poster = getThumbnailUrl(exercise);

  // Prüfen, ob eine gültige Cloudinary-Video-ID vorhanden ist.
  if (videoId && VIDEO_ID_MAPPING[videoId]) {
    const cloudinaryId = VIDEO_ID_MAPPING[videoId];
    // Use proper video dimensions and ensure full person is visible
    const videoUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/q_auto,c_pad,b_auto,w_640,h_480/${cloudinaryId}.mp4`;
        
    return {
      type: 'video',
      source: videoUrl,
      poster: poster,
    };
  }  
  // Wenn kein Video gefunden wird, 'none' zurückgeben.
  return {
    type: 'none',
    source: '',
    poster: poster,
  };
};

/**
 * Formatiert Zeit in Sekunden zu MM:SS Format (z.B. 90 -> "01:30")
 */
export const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00';
  }
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Berechnet die prozentuale Übereinstimmung zwischen zwei Arrays.
 * @param arr1 - Das erste Array.
 * @param arr2 - Das zweite Array.
 * @returns Die prozentuale Übereinstimmung.
 */
export const calculateArraySimilarity = (arr1: any[], arr2: any[]): number => {
  if (!arr1 || !arr2 || arr1.length === 0) {
    return 0;
  }

  const set2 = new Set(arr2);
  const intersection = arr1.filter(item => set2.has(item));

  return (intersection.length / arr1.length) * 100;
};

// Preload thumbnails for better performance
export const preloadThumbnails = (exercises: Exercise[]) => {
  exercises.forEach(exercise => {
    const img = new Image();
    img.src = getThumbnailUrl(exercise);
    // Preload images silently
  });
};

// Clear cache when needed
export const clearThumbnailCache = () => {
  thumbnailCache.clear();
};

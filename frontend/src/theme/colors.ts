/**
 * Color Palette for aboelo-fitness
 * Dark Green Theme for Senior Fitness App
 */

export const colors = {
  // Primary - Dark Teal/Green
  primary: {
    main: '#2d7d7d',
    light: '#3fa3a3',
    dark: '#1f5f5f',
    lighter: '#5ba3a3',
    darker: '#164545',
    gradient: 'linear-gradient(135deg, #2d7d7d 0%, #3fa3a3 100%)',
    gradientVertical: 'linear-gradient(180deg, #2d7d7d 0%, #1f5f5f 100%)',
  },

  // Secondary - Warm Coral/Orange
  secondary: {
    main: '#ff8a65',
    light: '#ffbb93',
    dark: '#f4511e',
    lighter: '#ffc1a6',
    darker: '#e64a19',
    gradient: 'linear-gradient(135deg, #ff8a65 0%, #ffbb93 100%)',
  },

  // Success - Green tones
  success: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    gradient: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
  },

  // Warning - Orange tones
  warning: {
    main: '#ff9800',
    light: '#ffb74d',
    dark: '#f57c00',
  },

  // Error - Red tones
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },

  // Info - Uses primary green
  info: {
    main: '#2d7d7d',
    light: '#3fa3a3',
    dark: '#1f5f5f',
  },

  // Neutral colors
  neutral: {
    white: '#ffffff',
    offWhite: '#fafafa',
    lightGray: '#f5f5f5',
    gray: '#e0e0e0',
    darkGray: '#757575',
    charcoal: '#424242',
    black: '#000000',
  },

  // Background colors
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
    lightGreen: '#e0f2f1',      // Very light green for cards/sections
    lightCoral: '#ffebee',       // Very light coral for accents
  },

  // Text colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#9e9e9e',
    hint: '#bdbdbd',
  },

  // Gradients for special elements
  gradients: {
    primaryToSecondary: 'linear-gradient(135deg, #2d7d7d 0%, #ff8a65 100%)',
    greenShades: 'linear-gradient(135deg, #1f5f5f 0%, #3fa3a3 100%)',
    coralShades: 'linear-gradient(135deg, #f4511e 0%, #ffbb93 100%)',
    successGlow: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
    subtleGreen: 'linear-gradient(180deg, rgba(45, 125, 125, 0.1) 0%, rgba(63, 163, 163, 0.05) 100%)',
  },

  // Overlay colors (with transparency)
  overlay: {
    dark: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(255, 255, 255, 0.9)',
    primary: 'rgba(45, 125, 125, 0.9)',
    secondary: 'rgba(255, 138, 101, 0.9)',
  },

  // Shadows
  shadows: {
    small: '0 2px 4px rgba(45, 125, 125, 0.1)',
    medium: '0 4px 8px rgba(45, 125, 125, 0.15)',
    large: '0 8px 16px rgba(45, 125, 125, 0.2)',
    card: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
};

export default colors;


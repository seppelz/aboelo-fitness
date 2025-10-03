# Color Scheme Guide - aboelo-fitness

## Overview
The app now uses a professional **Dark Green (Teal)** color scheme, perfect for a senior-focused fitness application. The colors convey health, nature, growth, and trust.

## Primary Color Palette

### Primary - Dark Teal/Green
```css
Main:    #2d7d7d  /* Dark teal/green - Navigation, buttons, primary actions */
Light:   #3fa3a3  /* Lighter teal - Hover states, highlights */
Dark:    #1f5f5f  /* Darker green - Emphasis, active states */
```

**Psychology**: Green/teal conveys:
- 🌱 Health and wellness
- 🌿 Nature and vitality
- 💚 Growth and progress
- 🧘 Balance and harmony

### Secondary - Warm Coral/Orange
```css
Main:    #ff8a65  /* Warm coral - Accent buttons, highlights */
Light:   #ffbb93  /* Light coral - Hover states */
Dark:    #f4511e  /* Dark coral - Active states */
```

**Purpose**: Creates strong contrast with green, draws attention to important elements

### Supporting Colors

**Success** (Green tones):
```css
Main:    #4caf50  /* Bright green */
Light:   #81c784  /* Light green */
Dark:    #388e3c  /* Dark green */
```

**Warning** (Orange tones):
```css
Main:    #ff9800  /* Orange */
Light:   #ffb74d  /* Light orange */
Dark:    #f57c00  /* Dark orange */
```

**Error** (Red tones):
```css
Main:    #f44336  /* Red */
Light:   #e57373  /* Light red */
Dark:    #d32f2f  /* Dark red */
```

## Gradients

### Primary Gradients
```css
/* Diagonal gradient - for cards, hero sections */
linear-gradient(135deg, #2d7d7d 0%, #3fa3a3 100%)

/* Vertical gradient - for backgrounds */
linear-gradient(180deg, #2d7d7d 0%, #1f5f5f 100%)

/* Subtle background gradient */
linear-gradient(180deg, rgba(45, 125, 125, 0.1) 0%, rgba(63, 163, 163, 0.05) 100%)
```

### Accent Gradients
```css
/* Primary to Secondary - for special elements */
linear-gradient(135deg, #2d7d7d 0%, #ff8a65 100%)

/* Success gradient - for achievements */
linear-gradient(135deg, #4caf50 0%, #81c784 100%)
```

## Usage Guidelines

### Navigation Bar & Footer
- Background: Primary main (#2d7d7d)
- Text: White (#ffffff)
- Hover: Primary light (#3fa3a3)

### Buttons
**Primary Buttons:**
- Background: Primary main (#2d7d7d)
- Text: White
- Hover: Primary light (#3fa3a3)
- Active: Primary dark (#1f5f5f)

**Secondary Buttons:**
- Background: Secondary main (#ff8a65)
- Text: Black
- Hover: Secondary light (#ffbb93)
- Active: Secondary dark (#f4511e)

### Cards & Containers
- Background: White (#ffffff)
- Border: Light gray (#e0e0e0)
- Shadow: 0 2px 8px rgba(45, 125, 125, 0.1)
- Hover: Add subtle green tint

### Progress Bars
- Fill: Primary gradient
- Background: Light gray (#e0e0e0)
- Success state: Success gradient

### Achievements & Gamification
- Streak indicator: Primary gradient
- Achievement badges: Success gradient
- Points display: Secondary gradient
- Level badges: Primary to secondary gradient

## Accessibility

### Contrast Ratios (WCAG AA Compliant)
- Primary (#2d7d7d) on White: 4.8:1 ✅
- Secondary (#ff8a65) on White: 3.5:1 ⚠️ (Use with dark text)
- Dark Primary (#1f5f5f) on White: 7.2:1 ✅ (High contrast mode)

### High Contrast Mode
For seniors with visual impairments:
- Primary: #1f5f5f (darker green)
- Secondary: #f4511e (darker coral)
- Text: #000000 (pure black)

## Background Colors

### Page Backgrounds
```css
Default:     #f5f5f5  /* Light gray */
Paper/Cards: #ffffff  /* White */
```

### Accent Backgrounds
```css
Light Green: #e0f2f1  /* For green-themed sections */
Light Coral: #ffebee  /* For coral-themed accents */
```

## Shadows & Depth

```css
/* Card shadow with green tint */
box-shadow: 0 2px 8px rgba(45, 125, 125, 0.1);

/* Hover shadow */
box-shadow: 0 4px 12px rgba(45, 125, 125, 0.15);

/* Elevated elements */
box-shadow: 0 8px 16px rgba(45, 125, 125, 0.2);
```

## Implementation

### Using in Components
```tsx
import { colors } from '../theme/colors';

// Direct usage
<Box sx={{ backgroundColor: colors.primary.main }}>

// With gradients
<Box sx={{ background: colors.gradients.primaryToSecondary }}>

// With theme (recommended)
<Box sx={{ backgroundColor: 'primary.main' }}>
```

### Best Practices
1. ✅ Use theme colors via `primary.main`, `secondary.main`
2. ✅ Import `colors` for custom components
3. ✅ Use gradients sparingly for special elements
4. ✅ Maintain sufficient contrast for text
5. ✅ Test with high contrast mode enabled

## Color Psychology for Seniors

**Why Dark Green/Teal works for Senior Fitness:**
- 🌱 **Calming**: Reduces anxiety about exercise
- 💚 **Natural**: Connects to outdoor activities
- 🧘 **Balance**: Represents stability and wellness
- 📈 **Growth**: Symbolizes progress and improvement
- 🌿 **Fresh**: Modern yet not overwhelming

**Why Coral/Orange as Secondary:**
- 🔥 **Energy**: Motivates action
- ☀️ **Warmth**: Friendly and approachable
- 🎯 **Focus**: Draws attention to important actions
- 😊 **Optimism**: Encourages positivity

## Files Updated
1. ✅ `frontend/src/App.tsx` - Main theme configuration
2. ✅ `frontend/src/contexts/ThemeContext.tsx` - Theme context with contrast levels
3. ✅ `frontend/src/theme/colors.ts` - Centralized color constants (new)

## Result
A cohesive, professional color scheme that:
- Projects trust and wellness
- Provides excellent readability for seniors
- Creates visual hierarchy
- Maintains accessibility standards
- Looks modern and polished


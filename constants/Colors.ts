// IMB Bank brand colors
export const Colors = {
  // Primary brand
  primary: '#004B5A',        // Deep teal (header, hero backgrounds)
  primaryDark: '#003542',    // Darker teal for pressed states
  primaryLight: '#006B7A',   // Lighter teal variant

  // Accent
  accent: '#C8E64A',         // Lime green (login button, highlights)
  accentDark: '#A8C636',     // Darker lime for pressed states

  // Neutrals
  white: '#FFFFFF',
  background: '#F5F7F8',     // Light gray background
  surface: '#FFFFFF',

  // Text
  textPrimary: '#1A2B33',    // Near-black for body text
  textSecondary: '#5C6F77',  // Gray for secondary text
  textOnPrimary: '#FFFFFF',  // White text on primary backgrounds
  textOnAccent: '#1A2B33',   // Dark text on accent backgrounds

  // Borders
  border: '#E2E8EB',
  borderLight: '#F0F3F4',

  // Utility
  info: '#2196F3',
  infoBg: '#E3F2FD',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  // Shadows
  shadow: 'rgba(0, 75, 90, 0.08)',
  shadowDark: 'rgba(0, 75, 90, 0.16)',
} as const;

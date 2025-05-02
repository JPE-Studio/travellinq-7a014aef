
/**
 * Utility functions for formatting displays
 */

/**
 * Formats distance in a user-friendly way
 * @param miles - Distance in miles
 * @returns Formatted distance string
 */
export const formatDistance = (miles: number): string => {
  if (miles < 0.1) {
    return 'Very close by';
  } else if (miles < 1) {
    return `${(miles * 1760).toFixed(0)} yards away`;
  } else if (miles < 10) {
    return `${miles.toFixed(1)} miles away`;
  } else {
    return `${Math.round(miles)} miles away`;
  }
};

// Language options array for reference
export const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' }
];

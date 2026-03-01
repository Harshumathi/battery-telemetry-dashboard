/**
 * Time formatting utilities for battery telemetry
 */

/**
 * Convert epoch milliseconds to readable date string
 * @param {number} epochMs - Epoch time in milliseconds
 * @returns {string} - Formatted date string (DD/MM/YYYY HH:mm)
 */
export const formatEpochToDateTime = (epochMs) => {
  if (!epochMs || isNaN(epochMs)) return 'Invalid Time';
  
  const date = new Date(epochMs);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Time';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Convert epoch milliseconds to readable date string with seconds
 * @param {number} epochMs - Epoch time in milliseconds
 * @returns {string} - Formatted date string (DD/MM/YYYY HH:mm:ss)
 */
export const formatEpochToDateTimeWithSeconds = (epochMs) => {
  if (!epochMs || isNaN(epochMs)) return 'Invalid Time';
  
  const date = new Date(epochMs);
  
  if (isNaN(date.getTime())) return 'Invalid Time';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

/**
 * Convert epoch milliseconds to time only
 * @param {number} epochMs - Epoch time in milliseconds
 * @returns {string} - Formatted time string (HH:mm)
 */
export const formatEpochToTime = (epochMs) => {
  if (!epochMs || isNaN(epochMs)) return 'Invalid Time';
  
  const date = new Date(epochMs);
  
  if (isNaN(date.getTime())) return 'Invalid Time';
  
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

/**
 * Get relative time from now
 * @param {number} epochMs - Epoch time in milliseconds
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (epochMs) => {
  if (!epochMs || isNaN(epochMs)) return 'Invalid Time';
  
  const now = Date.now();
  const diff = now - epochMs;
  
  if (diff < 0) return 'In the future';
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

/**
 * Format duration in milliseconds to readable string
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (durationMs) => {
  if (!durationMs || isNaN(durationMs)) return '0s';
  
  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Metrics calculation utilities for battery telemetry
 */
import { formatEpochToDateTime } from './formatTime';

/**
 * Calculate average value for a field
 * @param {Array} data - Telemetry data
 * @param {string} field - Field name
 * @returns {number|null} - Average value or null if no data
 */
export const calculateAverage = (data, field) => {
  if (!data || data.length === 0) return null;
  
  const validValues = data
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined && !isNaN(value));
  
  if (validValues.length === 0) return null;
  
  const sum = validValues.reduce((acc, value) => acc + value, 0);
  return sum / validValues.length;
};

/**
 * Calculate minimum value for a field
 * @param {Array} data - Telemetry data
 * @param {string} field - Field name
 * @returns {number|null} - Minimum value or null if no data
 */
export const calculateMinimum = (data, field) => {
  if (!data || data.length === 0) return null;
  
  const validValues = data
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined && !isNaN(value));
  
  if (validValues.length === 0) return null;
  
  return Math.min(...validValues);
};

/**
 * Calculate maximum value for a field
 * @param {Array} data - Telemetry data
 * @param {string} field - Field name
 * @returns {number|null} - Maximum value or null if no data
 */
export const calculateMaximum = (data, field) => {
  if (!data || data.length === 0) return null;
  
  const validValues = data
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined && !isNaN(value));
  
  if (validValues.length === 0) return null;
  
  return Math.max(...validValues);
};

/**
 * Calculate total charge cycles
 * @param {Array} data - Telemetry data
 * @returns {number|null} - Total charge cycles or null if no data
 */
export const calculateTotalChargeCycles = (data) => {
  if (!data || data.length === 0) return null;
  
  const latestRecord = data.reduce((latest, current) => 
    current.time > latest.time ? current : latest
  );
  
  return latestRecord.charge_cycle || null;
};

/**
 * Calculate charging vs idle duration
 * @param {Array} data - Telemetry data
 * @returns {Object} - Object with charging and idle durations in milliseconds
 */
export const calculateChargingIdleDuration = (data) => {
  if (!data || data.length === 0) return { charging: 0, idle: 0 };
  
  // Limit data size for performance
  const maxDataPoints = 5000;
  const sampleData = data.length > maxDataPoints 
    ? data.filter((_, index) => index % Math.ceil(data.length / maxDataPoints) === 0)
    : data;
  
  // Sort data by time
  const sortedData = [...sampleData].sort((a, b) => a.time - b.time);
  
  let chargingDuration = 0;
  let idleDuration = 0;
  
  for (let i = 0; i < sortedData.length - 1; i++) {
    const current = sortedData[i];
    const next = sortedData[i + 1];
    
    const timeDiff = next.time - current.time;
    
    if (current.current > 0) {
      chargingDuration += timeDiff;
    } else if (current.current === 0) {
      idleDuration += timeDiff;
    }
  }
  
  // Scale up to approximate full dataset duration
  if (data.length > maxDataPoints) {
    const scaleFactor = data.length / sampleData.length;
    chargingDuration *= scaleFactor;
    idleDuration *= scaleFactor;
  }
  
  return {
    charging: chargingDuration,
    idle: idleDuration
  };
};

/**
 * Calculate battery efficiency metrics
 * @param {Array} data - Telemetry data
 * @returns {Object} - Efficiency metrics
 */
export const calculateEfficiencyMetrics = (data) => {
  if (!data || data.length === 0) return null;
  
  const avgSoh = calculateAverage(data, 'soh');
  const avgVoltage = calculateAverage(data, 'battery_voltage');
  const maxTemp = calculateMaximum(data, 'battery_temp');
  const minTemp = calculateMinimum(data, 'battery_temp');
  
  return {
    averageSOH: avgSoh,
    averageVoltage: avgVoltage,
    temperatureRange: {
      min: minTemp,
      max: maxTemp,
      span: maxTemp && minTemp ? maxTemp - minTemp : null
    }
  };
};

/**
 * Calculate time-based statistics
 * @param {Array} data - Telemetry data
 * @returns {Object} - Time-based statistics
 */
export const calculateTimeStats = (data) => {
  if (!data || data.length === 0) return null;
  
  const times = data.map(record => record.time).filter(time => !isNaN(time));
  
  if (times.length === 0) return null;
  
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const duration = maxTime - minTime;
  
  return {
    startTime: minTime,
    endTime: maxTime,
    duration: duration,
    dataPoints: times.length,
    averageInterval: duration / (times.length - 1)
  };
};

/**
 * Calculate field-specific insights
 * @param {Array} data - Telemetry data
 * @param {string} field - Field name
 * @returns {Object} - Field insights
 */
export const calculateFieldInsights = (data, field) => {
  if (!data || data.length === 0) return null;

  // Limit data size for performance with large datasets
  const maxDataPoints = 10000;
  const sampleData = data.length > maxDataPoints 
    ? data.filter((_, index) => index % Math.ceil(data.length / maxDataPoints) === 0)
    : data;

  const values = sampleData
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined && !isNaN(value));
  
  if (values.length === 0) return null;
  
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // Calculate percentiles
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues[Math.floor(sortedValues.length / 2)];
  const p95 = sortedValues[Math.floor(sortedValues.length * 0.95)];
  const p5 = sortedValues[Math.floor(sortedValues.length * 0.05)];
  
  return {
    average: avg,
    minimum: min,
    maximum: max,
    median: median,
    standardDeviation: stdDev,
    percentiles: {
      p5: p5,
      p95: p95
    },
    dataPoints: data.length, // Return original data count
    sampleSize: values.length // Return sample size used
  };
};

/**
 * Generate growth data for charts
 * @param {Array} data - Telemetry data
 * @returns {Object} - Growth data for different metrics
 */
export const generateGrowthData = (data) => {
  if (!data || data.length === 0) return null;

  // Sample data for performance
  const maxDataPoints = 100;
  const sampleData = data.length > maxDataPoints 
    ? data.filter((_, index) => index % Math.ceil(data.length / maxDataPoints) === 0)
    : data;

  const sortedData = [...sampleData].sort((a, b) => a.time - b.time);

  // Generate SoC growth data
  const socGrowth = sortedData.map(record => ({
    time: formatEpochToDateTime(record.time),
    soc: record.soc
  }));

  // Generate charge cycle growth data
  const chargeCycleGrowth = sortedData.map(record => ({
    time: formatEpochToDateTime(record.time),
    charge_cycle: record.charge_cycle
  }));

  // Generate SoH degradation data
  const sohDegradation = sortedData.map(record => ({
    time: formatEpochToDateTime(record.time),
    soh: record.soh
  }));

  return {
    socGrowth,
    chargeCycleGrowth,
    sohDegradation
  };
};
/**
 * Generate comprehensive battery insights
 * @param {Array} data - Telemetry data
 * @returns {Object} - Comprehensive insights
 */
export const generateBatteryInsights = (data) => {
  if (!data || data.length === 0) return null;
  
  return {
    soc: calculateFieldInsights(data, 'soc'),
    soh: calculateFieldInsights(data, 'soh'),
    voltage: calculateFieldInsights(data, 'battery_voltage'),
    current: calculateFieldInsights(data, 'current'),
    temperature: calculateFieldInsights(data, 'battery_temp'),
    chargeCycles: calculateTotalChargeCycles(data),
    chargingIdleDuration: calculateChargingIdleDuration(data),
    efficiency: calculateEfficiencyMetrics(data),
    growthData: generateGrowthData(data)
  };
};

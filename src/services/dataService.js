/**
 * Dynamic data service for battery telemetry
 * Configured to handle any battery field dynamically
 */

// Configuration for dynamic field handling
export const FIELD_CONFIG = {
  // Core fields that are always expected
  time: {
    label: 'Time',
    type: 'timestamp',
    format: 'datetime',
    unit: ''
  },
  soc: {
    label: 'State of Charge',
    type: 'percentage',
    format: 'number',
    unit: '%',
    thresholds: { low: 20, critical: 10 }
  },
  soh: {
    label: 'State of Health',
    type: 'percentage',
    format: 'number',
    unit: '%',
    thresholds: { low: 50, critical: 30 }
  },
  battery_voltage: {
    label: 'Voltage',
    type: 'voltage',
    format: 'number',
    unit: 'V',
    thresholds: { low: 3.0, high: 4.2, critical: 2.8 }
  },
  current: {
    label: 'Current',
    type: 'current',
    format: 'number',
    unit: 'A',
    thresholds: { high: 10, critical: 15 }
  },
  charge_cycle: {
    label: 'Charge Cycles',
    type: 'counter',
    format: 'number',
    unit: ''
  },
  battery_temp: {
    label: 'Temperature',
    type: 'temperature',
    format: 'number',
    unit: '°C',
    thresholds: { high: 45, critical: 60 },
    nullable: true
  }
};

// Chart configuration - can be extended dynamically
export const CHART_CONFIG = {
  soc: { color: '#10b981', yAxisId: 'left' },
  battery_voltage: { color: '#3b82f6', yAxisId: 'left' },
  battery_temp: { color: '#f59e0b', yAxisId: 'right' },
  current: { color: '#8b5cf6', yAxisId: 'right' }
};

class DataService {
  constructor() {
    this.cache = new Map();
    this.dataFiles = [
      '/data/battery1.json',
      '/data/battery2.json',
      '/data/battery3.json'
    ];
  }

  /**
   * Load telemetry data from JSON files
   * @param {string} filePath - Path to JSON file
   * @returns {Promise<Array>} - Array of telemetry records
   */
  async loadTelemetryData(filePath) {
    if (this.cache.has(filePath)) {
      return this.cache.get(filePath);
    }

    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load data from ${filePath}: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate and normalize data
      const normalizedData = this.normalizeData(data);
      
      this.cache.set(filePath, normalizedData);
      
      return normalizedData;
    } catch (error) {
      console.error('Error loading telemetry data:', error);
      throw error;
    }
  }

  /**
   * Load specific battery data file
   * @param {string} batteryId - Battery ID ('1', '2', '3', or 'all')
   * @returns {Promise<Array>} - Array of telemetry records
   */
  async loadBatteryData(batteryId = 'all') {
    if (batteryId === 'all') {
      return this.loadAllBatteryData();
    }
    
    const filePath = `/data/battery${batteryId}.json`;
    return this.loadTelemetryData(filePath);
  }

  /**
   * Load all battery data files
   * @returns {Promise<Array>} - Combined array of all telemetry records
   */
  async loadAllBatteryData() {
    try {
      const dataPromises = this.dataFiles.map(file => 
        this.loadTelemetryData(file).catch(err => {
          console.warn(`Failed to load ${file}:`, err);
          return [];
        })
      );
      
      const dataArrays = await Promise.all(dataPromises);
      return dataArrays.flat();
    } catch (error) {
      console.error('Error loading all battery data:', error);
      throw error;
    }
  }

  /**
   * Normalize and validate telemetry data
   * @param {Array} data - Raw telemetry data
   * @returns {Array} - Normalized data
   */
  normalizeData(data) {
    if (!data || data.length === 0) return [];

    // Handle nested structure: [{ json: { data: [...] } }]
    if (data.length === 1 && data[0].json && data[0].json.data) {
      data = data[0].json.data;
    }

    return data
      .filter(record => record && typeof record === 'object')
      .map(record => {
        const normalized = { ...record };
        
        // Ensure time is a number
        if (normalized.time !== undefined) {
          normalized.time = Number(normalized.time);
        }
        
        // Convert numeric fields
        Object.keys(FIELD_CONFIG).forEach(field => {
          if (normalized[field] !== undefined && normalized[field] !== null) {
            normalized[field] = Number(normalized[field]);
          }
        });
        
        return normalized;
      })
      .filter(record => !isNaN(record.time));
  }

  /**
   * Get latest record from data
   * @param {Array} data - Telemetry data
   * @returns {Object|null} - Latest record
   */
  getLatestRecord(data) {
    if (!data || data.length === 0) return null;
    
    return data.reduce((latest, current) => 
      current.time > latest.time ? current : latest
    );
  }

  /**
   * Get data slice for charting (latest N records)
   * @param {Array} data - Full telemetry data
   * @param {number} limit - Number of records to return
   * @returns {Array} - Sliced data
   */
  getChartData(data, limit = 500) {
    if (!data || data.length === 0) return [];
    
    return data
      .slice(-limit)
      .sort((a, b) => a.time - b.time);
  }

  /**
   * Get dynamic field configuration
   * @param {string} fieldName - Field name
   * @returns {Object|null} - Field configuration
   */
  getFieldConfig(fieldName) {
    return FIELD_CONFIG[fieldName] || null;
  }

  /**
   * Get all available fields from data
   * @param {Array} data - Telemetry data
   * @returns {Array} - Array of field names
   */
  getAvailableFields(data) {
    if (!data || data.length === 0) return [];
    
    const sampleRecord = data[0];
    return Object.keys(sampleRecord).filter(key => 
      typeof sampleRecord[key] === 'number' || sampleRecord[key] === null
    );
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new DataService();

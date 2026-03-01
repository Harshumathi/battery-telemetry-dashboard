import { useState, useEffect, useMemo, useCallback } from 'react';
import dataService from '../services/dataService';
import { generateBatteryInsights } from '../utils/calculateMetrics';

/**
 * Custom hook for managing battery telemetry data
 * Handles data loading, filtering, and insights generation
 */
const useTelemetryData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBattery, setSelectedBattery] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // Load data on mount and when battery selection changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const loadedData = await dataService.loadBatteryData(selectedBattery);
        setData(loadedData);
      } catch (err) {
        console.error('Failed to load telemetry data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedBattery]);

  // Memoized filtered data based on time range
  const filteredData = useMemo(() => {
    if (!selectedTimeRange || !data.length) return data;
    
    const { start, end } = selectedTimeRange;
    return data.filter(record => 
      record.time >= start && record.time <= end
    );
  }, [data, selectedTimeRange]);

  // Memoized latest record
  const latestRecord = useMemo(() => {
    if (!filteredData.length) return null;
    return dataService.getLatestRecord(filteredData);
  }, [filteredData]);

  // Memoized chart data (limited to latest 500 points)
  const chartData = useMemo(() => {
    return dataService.getChartData(filteredData, 500);
  }, [filteredData]);

  // Memoized insights with sampling for large datasets
  const insights = useMemo(() => {
    if (!filteredData.length) return null;
    
    // Sample data for insights calculation to prevent crashes
    const maxDataPoints = 10000;
    const sampleData = filteredData.length > maxDataPoints 
      ? filteredData.filter((_, index) => index % Math.ceil(filteredData.length / maxDataPoints) === 0)
      : filteredData;
    
    return generateBatteryInsights(sampleData);
  }, [filteredData]);

  // Memoized available fields
  const availableFields = useMemo(() => {
    return dataService.getAvailableFields(filteredData);
  }, [filteredData]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      dataService.clearCache();
      
      const refreshedData = await dataService.loadBatteryData(selectedBattery);
      setData(refreshedData);
    } catch (err) {
      console.error('Failed to refresh telemetry data:', err);
      setError(err.message || 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [selectedBattery]);

  // Set time range filter
  const setTimeRange = useCallback((start, end) => {
    setSelectedTimeRange({ start, end });
  }, []);

  // Clear time range filter
  const clearTimeRange = useCallback(() => {
    setSelectedTimeRange(null);
  }, []);

  // Get data for specific time window
  const getDataForTimeWindow = useCallback((windowSize) => {
    if (!filteredData.length) return [];
    
    const latest = filteredData[filteredData.length - 1];
    const windowStart = latest.time - windowSize;
    
    return filteredData.filter(record => record.time >= windowStart);
  }, [filteredData]);

  return {
    // Data states
    data,
    filteredData,
    chartData,
    latestRecord,
    insights,
    availableFields,
    
    // Loading and error states
    loading,
    error,
    
    // Battery selection
    selectedBattery,
    setSelectedBattery,
    
    // Actions
    refreshData,
    setTimeRange,
    clearTimeRange,
    getDataForTimeWindow,
    
    // Computed properties
    hasData: data.length > 0,
    dataCount: data.length,
    selectedTimeRange
  };
};

export default useTelemetryData;

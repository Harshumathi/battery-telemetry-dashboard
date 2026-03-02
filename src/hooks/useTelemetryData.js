import { useState, useEffect, useMemo, useCallback } from 'react';
import dataService from '../services/dataService';
import { generateBatteryInsights } from '../utils/calculateMetrics';

const useTelemetryData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBattery, setSelectedBattery] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

 
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

  const latestRecord = useMemo(() => {
    if (!filteredData.length) return null;
    return dataService.getLatestRecord(filteredData);
  }, [filteredData]);

  const chartData = useMemo(() => {
    return dataService.getChartData(filteredData, 500);
  }, [filteredData]);

  
  const insights = useMemo(() => {
    if (!filteredData.length) return null;
    
   
    const maxDataPoints = 10000;
    const sampleData = filteredData.length > maxDataPoints 
      ? filteredData.filter((_, index) => index % Math.ceil(filteredData.length / maxDataPoints) === 0)
      : filteredData;
    
    return generateBatteryInsights(sampleData);
  }, [filteredData]);


  const availableFields = useMemo(() => {
    return dataService.getAvailableFields(filteredData);
  }, [filteredData]);


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

  const setTimeRange = useCallback((start, end) => {
    setSelectedTimeRange({ start, end });
  }, []);

  const clearTimeRange = useCallback(() => {
    setSelectedTimeRange(null);
  }, []);

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
    
    loading,
    error,
    

    selectedBattery,
    setSelectedBattery,
    

    refreshData,
    setTimeRange,
    clearTimeRange,
    getDataForTimeWindow,
    

    hasData: data.length > 0,
    dataCount: data.length,
    selectedTimeRange
  };
};

export default useTelemetryData;

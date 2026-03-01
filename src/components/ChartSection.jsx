import React, { useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { CHART_CONFIG, FIELD_CONFIG } from '../services/dataService';
import { formatEpochToDateTime } from '../utils/formatTime';

/**
 * ChartSection component with dynamic chart rendering
 * Supports multiple metrics with dual Y-axis and responsive design
 */
const ChartSection = React.memo(({ chartData, availableFields, loading }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(['soc', 'battery_voltage', 'battery_temp']);
  const [timeRange, setTimeRange] = useState(null);

  // Memoize formatted chart data
  const formattedChartData = useMemo(() => {
    if (!chartData || chartData.length === 0) return [];

    return chartData.map(record => {
      const formatted = {
        ...record,
        formattedTime: formatEpochToDateTime(record.time),
        timestamp: record.time
      };

      // Format numeric values for display
      availableFields.forEach(field => {
        const config = FIELD_CONFIG[field];
        if (config && record[field] !== null && record[field] !== undefined) {
          const value = Number(record[field]);
          if (!isNaN(value)) {
            switch (config.type) {
              case 'percentage':
                formatted[`${field}_display`] = Number(value.toFixed(1));
                break;
              case 'voltage':
              case 'current':
                formatted[`${field}_display`] = Number(value.toFixed(2));
                break;
              case 'temperature':
                formatted[`${field}_display`] = Number(value.toFixed(1));
                break;
              default:
                formatted[`${field}_display`] = Number(value.toFixed(2));
            }
          }
        }
      });

      return formatted;
    });
  }, [chartData, availableFields]);

  // Filter data based on time range
  const filteredChartData = useMemo(() => {
    if (!timeRange || !formattedChartData.length) return formattedChartData;

    return formattedChartData.filter(record => 
      record.time >= timeRange.start && record.time <= timeRange.end
    );
  }, [formattedChartData, timeRange]);

  // Get available metrics for charting
  const chartableMetrics = useMemo(() => {
    return availableFields.filter(field => 
      CHART_CONFIG[field] && 
      FIELD_CONFIG[field]?.type !== 'timestamp'
    );
  }, [availableFields]);

  // Toggle metric selection
  const toggleMetric = useCallback((metric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  }, []);

  // Custom tooltip for better data display
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <div className="chart-tooltip__time">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="chart-tooltip__item">
              <span 
                className="chart-tooltip__color" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="chart-tooltip__name">
                {FIELD_CONFIG[entry.dataKey]?.label || entry.dataKey}:
              </span>
              <span className="chart-tooltip__value">
                {entry.value} {FIELD_CONFIG[entry.dataKey]?.unit || ''}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  }, []);

  if (loading) {
    return (
      <div className="chart-section">
        <div className="chart-section__loading">
          <div className="loading-spinner"></div>
          <p>Loading charts...</p>
        </div>
      </div>
    );
  }

  if (!formattedChartData.length) {
    return (
      <div className="chart-section">
        <div className="chart-section__empty">
          <p>No data available for charts</p>
        </div>
      </div>
    );
  }

  // Separate metrics by Y-axis
  const leftAxisMetrics = selectedMetrics.filter(metric => 
    CHART_CONFIG[metric]?.yAxisId === 'left'
  );
  const rightAxisMetrics = selectedMetrics.filter(metric => 
    CHART_CONFIG[metric]?.yAxisId === 'right'
  );

  return (
    <div className="chart-section">
      <div className="chart-section__header">
        <h2 className="chart-section__title">Battery Telemetry Charts</h2>
        <div className="chart-section__controls">
          <div className="metric-selector">
            <span className="metric-selector__label">Display Metrics:</span>
            <div className="metric-selector__options">
              {chartableMetrics.map(metric => (
                <label key={metric} className="metric-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={() => toggleMetric(metric)}
                  />
                  <span 
                    className="metric-checkbox__color"
                    style={{ backgroundColor: CHART_CONFIG[metric]?.color }}
                  />
                  <span className="metric-checkbox__label">
                    {FIELD_CONFIG[metric]?.label || metric}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chart-section__content">
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={filteredChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="formattedTime"
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              
              {/* Left Y-axis */}
              {leftAxisMetrics.length > 0 && (
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Voltage / SoC / SoH (%)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                />
              )}
              
              {/* Right Y-axis */}
              {rightAxisMetrics.length > 0 && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Current / Temperature', 
                    angle: 90, 
                    position: 'insideRight',
                    style: { fontSize: 12 }
                  }}
                />
              )}
              
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Render selected metrics */}
              {selectedMetrics.map(metric => {
                const config = CHART_CONFIG[metric];
                const fieldConfig = FIELD_CONFIG[metric];
                
                return (
                  <Line
                    key={metric}
                    type="monotone"
                    dataKey={`${metric}_display`}
                    stroke={config?.color || '#8884d8'}
                    strokeWidth={2}
                    dot={false}
                    name={fieldConfig?.label || metric}
                    yAxisId={config?.yAxisId || 'left'}
                    connectNulls={false}
                  />
                );
              })}
              
              {/* Brush for time range selection */}
              <Brush
                dataKey="formattedTime"
                height={30}
                stroke="#8884d8"
                onChange={(range) => {
                  if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
                    const startRecord = filteredChartData[range.startIndex];
                    const endRecord = filteredChartData[range.endIndex];
                    if (startRecord && endRecord) {
                      setTimeRange({
                        start: startRecord.time,
                        end: endRecord.time
                      });
                    }
                  }
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Statistics */}
        <div className="chart-stats">
          <h3>Chart Statistics</h3>
          <div className="chart-stats__grid">
            <div className="stat-item">
              <span className="stat-item__label">Data Points:</span>
              <span className="stat-item__value">{filteredChartData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item__label">Time Range:</span>
              <span className="stat-item__value">
                {filteredChartData.length > 0 ? (
                  <>
                    {formatEpochToDateTime(filteredChartData[0].time)} - {' '}
                    {formatEpochToDateTime(filteredChartData[filteredChartData.length - 1].time)}
                  </>
                ) : 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-item__label">Selected Metrics:</span>
              <span className="stat-item__value">{selectedMetrics.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChartSection.displayName = 'ChartSection';

export default ChartSection;

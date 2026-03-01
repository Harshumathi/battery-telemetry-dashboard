import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { FIELD_CONFIG } from '../services/dataService';
import { formatDuration, formatEpochToDateTime } from '../utils/formatTime';

/**
 * InsightsPanel component displaying computed battery metrics
 * Dynamically adapts to available data fields
 */
const InsightsPanel = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="insights-panel">
        <div className="insights-panel__loading">
          <div className="loading-spinner"></div>
          <p>Calculating insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="insights-panel">
        <div className="insights-panel__empty">
          <p>No insights available</p>
        </div>
      </div>
    );
  }

  const renderGrowthCharts = () => {
    if (!insights.growthData) return null;

    return (
      <div className="growth-charts">
        <h3 className="insights-panel__subtitle">Growth Trends</h3>
        <div className="charts-grid">
          {/* SoC Growth Chart */}
          {insights.growthData.socGrowth && (
            <div className="growth-chart">
              <h4>State of Charge Growth</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={insights.growthData.socGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="soc" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Charge Cycles Growth */}
          {insights.growthData.chargeCycleGrowth && (
            <div className="growth-chart">
              <h4>Charge Cycles Over Time</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={insights.growthData.chargeCycleGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="charge_cycle" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* SoH Degradation */}
          {insights.growthData.sohDegradation && (
            <div className="growth-chart">
              <h4>State of Health Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={insights.growthData.sohDegradation}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="soh" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFieldInsights = (fieldData, fieldName) => {
    if (!fieldData) return null;

    const config = FIELD_CONFIG[fieldName];
    const label = config?.label || fieldName;
    const unit = config?.unit || '';

    return (
      <div key={fieldName} className="insight-card">
        <h4 className="insight-card__title">{label}</h4>
        <div className="insight-card__metrics">
          <div className="metric-row">
            <span className="metric-row__label">Average:</span>
            <span className="metric-row__value">
              {fieldData.average ? `${fieldData.average.toFixed(2)}${unit}` : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Minimum:</span>
            <span className="metric-row__value">
              {fieldData.minimum ? `${fieldData.minimum.toFixed(2)}${unit}` : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Maximum:</span>
            <span className="metric-row__value">
              {fieldData.maximum ? `${fieldData.maximum.toFixed(2)}${unit}` : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Median:</span>
            <span className="metric-row__value">
              {fieldData.median ? `${fieldData.median.toFixed(2)}${unit}` : 'N/A'}
            </span>
          </div>
          {fieldData.percentiles && (
            <>
              <div className="metric-row">
                <span className="metric-row__label">5th Percentile:</span>
                <span className="metric-row__value">
                  {fieldData.percentiles.p5 ? `${fieldData.percentiles.p5.toFixed(2)}${unit}` : 'N/A'}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-row__label">95th Percentile:</span>
                <span className="metric-row__value">
                  {fieldData.percentiles.p95 ? `${fieldData.percentiles.p95.toFixed(2)}${unit}` : 'N/A'}
                </span>
              </div>
            </>
          )}
          <div className="metric-row">
            <span className="metric-row__label">Std Deviation:</span>
            <span className="metric-row__value">
              {fieldData.standardDeviation ? `${fieldData.standardDeviation.toFixed(2)}${unit}` : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Data Points:</span>
            <span className="metric-row__value">
              {fieldData.dataPoints?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeStats = () => {
    if (!insights.timeStats) return null;

    const { startTime, endTime, duration, dataPoints, averageInterval } = insights.timeStats;

    return (
      <div className="insight-card">
        <h4 className="insight-card__title">Time Statistics</h4>
        <div className="insight-card__metrics">
          <div className="metric-row">
            <span className="metric-row__label">Start Time:</span>
            <span className="metric-row__value">
              {startTime ? formatEpochToDateTime(startTime) : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">End Time:</span>
            <span className="metric-row__value">
              {endTime ? formatEpochToDateTime(endTime) : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Duration:</span>
            <span className="metric-row__value">
              {duration ? formatDuration(duration) : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Total Data Points:</span>
            <span className="metric-row__value">
              {dataPoints?.toLocaleString() || 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Avg. Interval:</span>
            <span className="metric-row__value">
              {averageInterval ? formatDuration(averageInterval) : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderChargingInsights = () => {
    if (!insights.chargingIdleTime) return null;

    const { charging, idle } = insights.chargingIdleTime;
    const total = charging + idle;
    const chargingPercentage = total > 0 ? (charging / total) * 100 : 0;
    const idlePercentage = total > 0 ? (idle / total) * 100 : 0;

    return (
      <div className="insight-card">
        <h4 className="insight-card__title">Charging Analysis</h4>
        <div className="insight-card__metrics">
          <div className="metric-row">
            <span className="metric-row__label">Charging Time:</span>
            <span className="metric-row__value">
              {formatDuration(charging)} ({chargingPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Idle Time:</span>
            <span className="metric-row__value">
              {formatDuration(idle)} ({idlePercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Total Monitored:</span>
            <span className="metric-row__value">
              {formatDuration(total)}
            </span>
          </div>
        </div>
        
        {/* Charging time bar chart */}
        <div className="charging-chart">
          <div className="charging-chart__bar">
            <div 
              className="charging-chart__charging"
              style={{ width: `${chargingPercentage}%` }}
              title={`Charging: ${chargingPercentage.toFixed(1)}%`}
            />
            <div 
              className="charging-chart__idle"
              style={{ width: `${idlePercentage}%` }}
              title={`Idle: ${idlePercentage.toFixed(1)}%`}
            />
          </div>
          <div className="charging-chart__legend">
            <span className="charging-chart__legend-item">
              <span className="charging-chart__color charging-chart__color--charging"></span>
              Charging
            </span>
            <span className="charging-chart__legend-item">
              <span className="charging-chart__color charging-chart__color--idle"></span>
              Idle
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderEfficiencyMetrics = () => {
    if (!insights.efficiency) return null;

    const { averageSOH, averageVoltage, temperatureRange } = insights.efficiency;

    return (
      <div className="insight-card">
        <h4 className="insight-card__title">Efficiency Metrics</h4>
        <div className="insight-card__metrics">
          <div className="metric-row">
            <span className="metric-row__label">Average SoH:</span>
            <span className="metric-row__value">
              {averageSOH ? `${averageSOH.toFixed(1)}%` : 'N/A'}
            </span>
          </div>
          <div className="metric-row">
            <span className="metric-row__label">Average Voltage:</span>
            <span className="metric-row__value">
              {averageVoltage ? `${averageVoltage.toFixed(2)}V` : 'N/A'}
            </span>
          </div>
          {temperatureRange && (
            <>
              <div className="metric-row">
                <span className="metric-row__label">Min Temperature:</span>
                <span className="metric-row__value">
                  {temperatureRange.min ? `${temperatureRange.min.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-row__label">Max Temperature:</span>
                <span className="metric-row__value">
                  {temperatureRange.max ? `${temperatureRange.max.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
              <div className="metric-row">
                <span className="metric-row__label">Temp. Range:</span>
                <span className="metric-row__value">
                  {temperatureRange.span ? `${temperatureRange.span.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="insights-panel">
      <div className="insights-panel__header">
        <h2 className="insights-panel__title">Battery Insights</h2>
      </div>
      
      <div className="insights-panel__content">
        {/* Key Metrics Summary */}
        <div className="insights-summary">
          <div className="summary-card">
            <h3>Key Metrics</h3>
            <div className="summary-metrics">
              {insights.chargeCycles !== null && (
                <div className="summary-metric">
                  <span className="summary-metric__label">Total Charge Cycles:</span>
                  <span className="summary-metric__value">
                    {insights.chargeCycles.toLocaleString()}
                  </span>
                </div>
              )}
              {insights.soc?.average && (
                <div className="summary-metric">
                  <span className="summary-metric__label">Average SoC:</span>
                  <span className="summary-metric__value">
                    {insights.soc.average.toFixed(1)}%
                  </span>
                </div>
              )}
              {insights.voltage?.average && (
                <div className="summary-metric">
                  <span className="summary-metric__label">Average Voltage:</span>
                  <span className="summary-metric__value">
                    {insights.voltage.average.toFixed(2)}V
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Insights Grid */}
        <div className="insights-grid">
          {/* Field-specific insights */}
          {renderFieldInsights(insights.soc, 'soc')}
          {renderFieldInsights(insights.soh, 'soh')}
          {renderFieldInsights(insights.voltage, 'battery_voltage')}
          {renderFieldInsights(insights.current, 'current')}
          {renderFieldInsights(insights.temperature, 'battery_temp')}
          
          {/* Growth Charts */}
          {renderGrowthCharts()}
          
          {/* Time statistics */}
          {renderTimeStats()}
          
          {/* Charging analysis */}
          {renderChargingInsights()}
          
          {/* Efficiency metrics */}
          {renderEfficiencyMetrics()}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;

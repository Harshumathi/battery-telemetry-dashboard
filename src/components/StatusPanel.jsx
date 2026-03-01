import React from 'react';
import StatusCard from './StatusCard';
import { FIELD_CONFIG } from '../services/dataService';
import { getRelativeTime } from '../utils/formatTime';

/**
 * StatusPanel component that displays dynamic status cards
 * Automatically adapts to available battery fields
 */
const StatusPanel = React.memo(({ latestRecord, availableFields, loading }) => {
  if (loading) {
    return (
      <div className="status-panel">
        <div className="status-panel__loading">
          <div className="loading-spinner"></div>
          <p>Loading battery status...</p>
        </div>
      </div>
    );
  }

  if (!latestRecord) {
    return (
      <div className="status-panel">
        <div className="status-panel__empty">
          <p>No battery data available</p>
        </div>
      </div>
    );
  }

  // Define priority order for status cards
  const fieldPriority = [
    'soc',           // State of Charge - most important
    'battery_temp',  // Temperature - safety critical
    'battery_voltage', // Voltage - essential
    'current',       // Current - important
    'soh',           // State of Health - important
    'charge_cycle'   // Charge cycles - secondary
  ];

  // Filter and sort fields based on priority and availability
  const displayFields = React.useMemo(() => {
    return fieldPriority
      .filter(field => availableFields.includes(field))
      .concat(
        availableFields
          .filter(field => !fieldPriority.includes(field))
          .sort()
      );
  }, [availableFields]);

  return (
    <div className="status-panel">
      <div className="status-panel__header">
        <h2 className="status-panel__title">Battery Status</h2>
        <div className="status-panel__timestamp">
          Last update: {getRelativeTime(latestRecord.time)}
        </div>
      </div>
      
      <div className="status-panel__grid">
        {displayFields.map(fieldName => (
          <StatusCard
            key={fieldName}
            fieldName={fieldName}
            value={latestRecord[fieldName]}
            config={FIELD_CONFIG[fieldName]}
            lastUpdate={latestRecord.time}
          />
        ))}
      </div>

      {/* Quick Status Summary */}
      <div className="status-panel__summary">
        <div className="status-summary">
          <div className="status-summary__item">
            <span className="status-summary__label">Overall Status:</span>
            <span className={`status-summary__value ${getOverallStatus(latestRecord)}`}>
              {getOverallStatusText(latestRecord)}
            </span>
          </div>
          <div className="status-summary__item">
            <span className="status-summary__label">Data Points:</span>
            <span className="status-summary__value">
              {latestRecord.dataPoints || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Determine overall battery status based on critical parameters
 */
const getOverallStatus = (record) => {
  const { soc, battery_temp, battery_voltage, soh } = record;
  
  // Check for critical conditions
  if (soc < 10) return 'critical';
  if (battery_temp > 60) return 'critical';
  if (battery_voltage < 2.8) return 'critical';
  if (soh < 30) return 'critical';
  
  // Check for warning conditions
  if (soc < 20) return 'warning';
  if (battery_temp > 45) return 'warning';
  if (battery_voltage < 3.0) return 'warning';
  if (soh < 50) return 'warning';
  
  return 'normal';
};

/**
 * Get human-readable overall status text
 */
const getOverallStatusText = (record) => {
  const status = getOverallStatus(record);
  
  switch (status) {
    case 'critical':
      return 'Critical';
    case 'warning':
      return 'Warning';
    default:
      return 'Normal';
  }
};

StatusPanel.displayName = 'StatusPanel';

export default StatusPanel;

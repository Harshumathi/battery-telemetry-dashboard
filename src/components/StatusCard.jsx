import React from 'react';
import { FIELD_CONFIG } from '../services/dataService';

/**
 * Dynamic StatusCard component that adapts to any battery field
 * Handles conditional styling based on field configuration thresholds
 */
const StatusCard = React.memo(({ fieldName, value, config = null, lastUpdate = null }) => {
  // Get field configuration or use default
  const fieldConfig = config || FIELD_CONFIG[fieldName] || {};
  const { label, unit, thresholds, nullable } = fieldConfig;

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return (
      <div className={`status-card status-card--offline ${nullable ? 'status-card--nullable' : ''}`}>
        <div className="status-card__header">
          <h3 className="status-card__title">{label || fieldName}</h3>
        </div>
        <div className="status-card__content">
          <div className="status-card__value status-card__value--offline">
            {nullable ? 'Sensor Offline' : 'No Data'}
          </div>
        </div>
        {lastUpdate && (
          <div className="status-card__footer">
            <span className="status-card__timestamp">
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Determine status based on thresholds
  const getCardStatus = () => {
    if (!thresholds) return 'normal';
    
    const numValue = Number(value);
    if (isNaN(numValue)) return 'normal';

    // Check critical thresholds first
    if (thresholds.critical !== undefined) {
      if ((thresholds.low && numValue <= thresholds.critical) ||
          (thresholds.high && numValue >= thresholds.critical)) {
        return 'critical';
      }
    }

    // Check warning thresholds
    if (thresholds.low && numValue <= thresholds.low) return 'warning';
    if (thresholds.high && numValue >= thresholds.high) return 'warning';

    return 'normal';
  };

  const status = getCardStatus();

  // Format value based on field type
  const formatValue = (val) => {
    const numValue = Number(val);
    if (isNaN(numValue)) return 'Invalid';

    switch (fieldConfig.type) {
      case 'percentage':
        return `${numValue.toFixed(1)}${unit}`;
      case 'voltage':
        return `${numValue.toFixed(2)}${unit}`;
      case 'current':
        return `${numValue.toFixed(2)}${unit}`;
      case 'temperature':
        return `${numValue.toFixed(1)}${unit}`;
      case 'counter':
        return numValue.toLocaleString();
      case 'timestamp':
        return new Date(numValue).toLocaleString();
      default:
        return `${numValue.toFixed(2)}${unit}`;
    }
  };

  // Get status indicator
  const getStatusIndicator = () => {
    switch (status) {
      case 'critical':
        return '⚠️';
      case 'warning':
        return '⚡';
      default:
        return '✓';
    }
  };

  return (
    <div className={`status-card status-card--${status}`}>
      <div className="status-card__header">
        <h3 className="status-card__title">{label || fieldName}</h3>
        <span className="status-card__indicator">{getStatusIndicator()}</span>
      </div>
      <div className="status-card__content">
        <div className="status-card__value">
          {formatValue(value)}
        </div>
        {fieldConfig.type === 'percentage' && (
          <div className="status-card__progress">
            <div 
              className="status-card__progress-bar"
              style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }}
            />
          </div>
        )}
      </div>
      {lastUpdate && (
        <div className="status-card__footer">
          <span className="status-card__timestamp">
            {new Date(lastUpdate).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
});

StatusCard.displayName = 'StatusCard';

export default StatusCard;

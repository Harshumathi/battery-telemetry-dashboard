import React, { useState, useMemo, useCallback } from 'react';
import { FixedSizeList } from 'react-window';
import { FIELD_CONFIG } from '../services/dataService';
import { formatEpochToDateTime } from '../utils/formatTime';

/**
 * Virtualized table component for handling large datasets
 * Uses react-window for efficient rendering
 */
const VirtualizedTable = React.memo(({ 
  data, 
  availableFields, 
  loading,
  height = 400,
  rowHeight = 40
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });
  const [filters, setFilters] = useState({});

  // Define column configuration with priority order
  const columnConfig = useMemo(() => {
    const priorityOrder = ['time', 'soc', 'soh', 'battery_voltage', 'current', 'battery_temp', 'charge_cycle'];
    
    return priorityOrder
      .filter(field => availableFields.includes(field))
      .map(field => ({
        key: field,
        label: FIELD_CONFIG[field]?.label || field,
        type: FIELD_CONFIG[field]?.type || 'number',
        unit: FIELD_CONFIG[field]?.unit || '',
        sortable: true,
        filterable: true,
        width: field === 'time' ? 180 : 120
      }))
      .concat(
        availableFields
          .filter(field => !priorityOrder.includes(field))
          .map(field => ({
            key: field,
            label: FIELD_CONFIG[field]?.label || field,
            type: FIELD_CONFIG[field]?.type || 'number',
            unit: FIELD_CONFIG[field]?.unit || '',
            sortable: true,
            filterable: true,
            width: 120
          }))
      );
  }, [availableFields]);

  // Filter data based on active filters
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.filter(record => {
      return Object.entries(filters).every(([field, filterValue]) => {
        if (!filterValue || filterValue.trim() === '') return true;
        
        const value = record[field];
        if (value === null || value === undefined) return false;
        
        // Convert to string for case-insensitive comparison
        const stringValue = String(value).toLowerCase();
        const filterString = filterValue.toLowerCase();
        
        return stringValue.includes(filterString);
      });
    });
  }, [data, filters]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!filteredData.length) return [];

    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare based on data type
      let comparison = 0;
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  // Handle sort change
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle filter change
  const handleFilter = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Format cell value based on field type
  const formatCellValue = useCallback((value, field) => {
    if (value === null || value === undefined) return '—';
    
    const config = FIELD_CONFIG[field];
    
    if (field === 'time') {
      return formatEpochToDateTime(value);
    }
    
    if (typeof value === 'number') {
      switch (config?.type) {
        case 'percentage':
          return `${value.toFixed(1)}${config.unit || ''}`;
        case 'voltage':
        case 'current':
          return `${value.toFixed(2)}${config.unit || ''}`;
        case 'temperature':
          return `${value.toFixed(1)}${config.unit || ''}`;
        case 'counter':
          return value.toLocaleString();
        default:
          return `${value.toFixed(2)}${config.unit || ''}`;
      }
    }
    
    return String(value);
  }, []);

  // Render table row
  const Row = useCallback(({ index, style }) => {
    const record = sortedData[index];
    
    return (
      <div style={style} className="virtualized-table__row">
        {columnConfig.map((column) => (
          <div 
            key={column.key} 
            className="virtualized-table__cell"
            style={{ width: column.width }}
          >
            {formatCellValue(record[column.key], column.key)}
          </div>
        ))}
      </div>
    );
  }, [sortedData, columnConfig, formatCellValue]);

  if (loading) {
    return (
      <div className="virtualized-table">
        <div className="virtualized-table__loading">
          <div className="loading-spinner"></div>
          <p>Loading data table...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="virtualized-table">
        <div className="virtualized-table__empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="virtualized-table">
      <div className="virtualized-table__header">
        <h2 className="virtualized-table__title">Battery Telemetry Data</h2>
        <div className="virtualized-table__info">
          <span>
            Showing {sortedData.length.toLocaleString()} records
            {filteredData.length !== data.length && (
              <> (filtered from {data.length.toLocaleString()} total)</>
            )}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="virtualized-table__filters">
        <div className="filter-controls">
          <button 
            className="btn btn--secondary"
            onClick={clearFilters}
            disabled={Object.keys(filters).length === 0}
          >
            Clear Filters
          </button>
        </div>
        <div className="filter-inputs">
          {columnConfig.map(column => (
            <div key={column.key} className="filter-input">
              <label htmlFor={`filter-${column.key}`}>{column.label}:</label>
              <input
                id={`filter-${column.key}`}
                type="text"
                placeholder={`Filter ${column.label.toLowerCase()}...`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilter(column.key, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="virtualized-table__container">
        {/* Header */}
        <div className="virtualized-table__header-row">
          {columnConfig.map(column => (
            <div 
              key={column.key}
              className={`virtualized-table__header-cell ${sortConfig.key === column.key ? `sorted-${sortConfig.direction}` : ''}`}
              style={{ width: column.width }}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="table-header">
                <span>{column.label}</span>
                {column.sortable && (
                  <span className="sort-indicator">
                    {sortConfig.key === column.key ? (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    ) : '↕'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Virtualized Body */}
        <div className="virtualized-table__body">
          <FixedSizeList
            height={height}
            itemCount={sortedData.length}
            itemSize={rowHeight}
            itemData={{}}
          >
            {Row}
          </FixedSizeList>
        </div>
      </div>

      {/* Footer */}
      <div className="virtualized-table__footer">
        <div className="virtualized-table__stats">
          <span>Total Records: {data.length.toLocaleString()}</span>
          <span>Filtered: {sortedData.length.toLocaleString()}</span>
          <span>Columns: {columnConfig.length}</span>
        </div>
      </div>
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;

import React from 'react';
import VirtualizedTable from './VirtualizedTable';
import { FIELD_CONFIG } from '../services/dataService';
import { formatEpochToDateTime } from '../utils/formatTime';

/**
 * DataTable component wrapper that uses virtualization for large datasets
 * Falls back to simple table for smaller datasets
 */
const DataTable = React.memo(({ data, availableFields, loading }) => {
  // Use virtualized table for datasets larger than 1000 records
  const useVirtualized = data && data.length > 1000;

  if (useVirtualized) {
    return (
      <VirtualizedTable
        data={data}
        availableFields={availableFields}
        loading={loading}
        height={400}
        rowHeight={40}
      />
    );
  }

  // For smaller datasets, use the original table implementation
  // (This is the existing DataTable code with React.memo optimization)
  return <SimpleDataTable data={data} availableFields={availableFields} loading={loading} />;
});

/**
 * Simple table component for smaller datasets
 */
const SimpleDataTable = React.memo(({ data, availableFields, loading }) => {
  const [sortConfig, setSortConfig] = React.useState({ key: 'time', direction: 'desc' });
  const [filters, setFilters] = React.useState({});
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(50);

  // Define column configuration with priority order
  const columnConfig = React.useMemo(() => {
    const priorityOrder = ['time', 'soc', 'soh', 'battery_voltage', 'current', 'battery_temp', 'charge_cycle'];
    
    return priorityOrder
      .filter(field => availableFields.includes(field))
      .map(field => ({
        key: field,
        label: FIELD_CONFIG[field]?.label || field,
        type: FIELD_CONFIG[field]?.type || 'number',
        unit: FIELD_CONFIG[field]?.unit || '',
        sortable: true,
        filterable: true
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
            filterable: true
          }))
      );
  }, [availableFields]);

  // Filter data based on active filters
  const filteredData = React.useMemo(() => {
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
  const sortedData = React.useMemo(() => {
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

  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize]);

  // Handle sort change
  const handleSort = React.useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle filter change
  const handleFilter = React.useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Clear all filters
  const clearFilters = React.useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  // Format cell value based on field type
  const formatCellValue = React.useCallback((value, field) => {
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

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, sortedData.length);

  if (loading) {
    return (
      <div className="data-table">
        <div className="data-table__loading">
          <div className="loading-spinner"></div>
          <p>Loading data table...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table">
        <div className="data-table__empty">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table">
      <div className="data-table__header">
        <h2 className="data-table__title">Battery Telemetry Data</h2>
        <div className="data-table__controls">
          <div className="table-controls">
            <div className="table-controls__item">
              <label htmlFor="page-size">Rows per page:</label>
              <select
                id="page-size"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <button 
              className="btn btn--secondary"
              onClick={clearFilters}
              disabled={Object.keys(filters).length === 0}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="data-table__filters">
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

      {/* Table Info */}
      <div className="data-table__info">
        <span>
          Showing {startRecord}-{endRecord} of {sortedData.length} records
          {filteredData.length !== data.length && (
            <> (filtered from {data.length} total)</>
          )}
        </span>
      </div>

      {/* Table */}
      <div className="data-table__container">
        <table className="data-table__table">
          <thead>
            <tr>
              {columnConfig.map(column => (
                <th 
                  key={column.key}
                  className={sortConfig.key === column.key ? `sorted-${sortConfig.direction}` : ''}
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
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record, index) => (
              <tr key={`${record.time}-${index}`} className="data-row">
                {columnConfig.map(column => (
                  <td key={column.key} className="data-cell">
                    {formatCellValue(record[column.key], column.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="data-table__pagination">
          <div className="pagination">
            <button
              className="pagination__btn"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="pagination__btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination__pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination__page ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              className="pagination__btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="pagination__btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

SimpleDataTable.displayName = 'SimpleDataTable';

DataTable.displayName = 'DataTable';

export default DataTable;

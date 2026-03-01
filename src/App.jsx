import React, { useState, useCallback } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import StatusPanel from './components/StatusPanel';
import ChartSection from './components/ChartSection';
import InsightsPanel from './components/InsightsPanel';
import DataTable from './components/DataTable';
import useTelemetryData from './hooks/useTelemetryData';
import { ThemeProvider, useTheme } from './hooks/useTheme.jsx';
import './styles/dashboard.css';
import './styles/theme.css';
import './styles/cards.css';
import './styles/charts.css';
import './styles/insights.css';
import './styles/table.css';
import './styles/virtualized-table.css';

/**
 * Theme-aware app content component
 */
const AppContent = () => {
  const [activeView, setActiveView] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Use the optimized telemetry hook
  const {
    chartData,
    latestRecord,
    insights,
    availableFields,
    loading,
    error,
    refreshData,
    hasData,
    dataCount,
    selectedTimeRange,
    setTimeRange,
    clearTimeRange,
    selectedBattery,
    setSelectedBattery
  } = useTelemetryData();

  // Memoized refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      await refreshData();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, [refreshData]);

  // Memoized battery change handler
  const handleBatteryChange = useCallback((batteryId) => {
    setSelectedBattery(batteryId);
  }, [setSelectedBattery]);

  // Memoized view change handler
  const handleViewChange = useCallback((view) => {
    setActiveView(view);
  }, []);

  // Memoized time range handlers
  const handleTimeRangeChange = useCallback((start, end) => {
    setTimeRange(start, end);
  }, [setTimeRange]);

  const handleClearTimeRange = useCallback(() => {
    clearTimeRange();
  }, [clearTimeRange]);

  if (error) {
    return (
      <div className="app">
        <div className="error-screen">
          <div className="error-screen__content">
            <h1 className="error-screen__title">Data Loading Error</h1>
            <p className="error-screen__message">{error}</p>
            <button 
              className="btn btn--primary"
              onClick={handleRefresh}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app" key={refreshKey}>
      <ErrorBoundary>
        <header className="app-header">
          <div className="app-header__content">
            <h1 className="app-header__title">Battery Telemetry Dashboard</h1>
            <div className="app-header__controls">
              {/* Battery Selector */}
              <div className="battery-selector">
                <label htmlFor="battery-select" className="battery-selector__label">
                  Battery:
                </label>
                <select
                  id="battery-select"
                  className="battery-selector__select"
                  value={selectedBattery}
                  onChange={(e) => handleBatteryChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="all">All Batteries</option>
                  <option value="1">Battery 1</option>
                  <option value="2">Battery 2</option>
                  <option value="3">Battery 3</option>
                </select>
              </div>

              <div className="data-info">
                {hasData && (
                  <span className="data-count">
                    {dataCount.toLocaleString()} records
                    {selectedBattery !== 'all' && (
                      <span className="data-source">
                        (Battery {selectedBattery})
                      </span>
                    )}
                  </span>
                )}
                {selectedTimeRange && (
                  <button 
                    className="btn btn--secondary"
                    onClick={handleClearTimeRange}
                  >
                    Clear Time Range
                  </button>
                )}
              </div>
              
              {/* Theme Toggle */}
              <div className="theme-toggle-container">
                <button 
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                >
                  <div className="theme-toggle__slider">
                    {isDark ? '🌙' : '☀️'}
                  </div>
                </button>
                <span className="theme-toggle-label">
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </div>
              
              <button 
                className="btn btn--primary"
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </header>

        <main className="app-main">
          {/* Navigation */}
          <nav className="app-nav">
            <div className="nav-tabs">
              <button
                className={`nav-tab ${activeView === 'overview' ? 'active' : ''}`}
                onClick={() => handleViewChange('overview')}
              >
                Overview
              </button>
              <button
                className={`nav-tab ${activeView === 'charts' ? 'active' : ''}`}
                onClick={() => handleViewChange('charts')}
              >
                Charts
              </button>
              <button
                className={`nav-tab ${activeView === 'insights' ? 'active' : ''}`}
                onClick={() => handleViewChange('insights')}
              >
                Insights
              </button>
              <button
                className={`nav-tab ${activeView === 'data' ? 'active' : ''}`}
                onClick={() => handleViewChange('data')}
              >
                Data Table
              </button>
            </div>
          </nav>

          {/* Content */}
          <div className="app-content">
            {activeView === 'overview' && (
              <div className="overview-view">
                <div className="overview-grid">
                  <div className="overview-section">
                    <StatusPanel
                      latestRecord={latestRecord}
                      availableFields={availableFields}
                      loading={loading}
                    />
                  </div>
                  <div className="overview-section">
                    <InsightsPanel
                      insights={insights}
                      loading={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeView === 'charts' && (
              <div className="charts-view">
                <ChartSection
                  chartData={chartData}
                  availableFields={availableFields}
                  loading={loading}
                />
              </div>
            )}

            {activeView === 'insights' && (
              <div className="insights-view">
                <InsightsPanel
                  insights={insights}
                  loading={loading}
                  expanded={true}
                />
              </div>
            )}

            {activeView === 'data' && (
              <div className="data-view">
                <DataTable
                  data={chartData}
                  availableFields={availableFields}
                  loading={loading}
                />
              </div>
            )}
          </div>
        </main>

        <footer className="app-footer">
          <div className="app-footer__content">
            <p className="app-footer__text">
              Battery Telemetry Dashboard • Real-time monitoring and analytics
            </p>
            <div className="app-footer__status">
              {loading && (
                <span className="status-indicator status-indicator--loading">
                  Loading data...
                </span>
              )}
              {!loading && hasData && (
                <span className="status-indicator status-indicator--success">
                  Data loaded successfully
                </span>
              )}
            </div>
          </div>
        </footer>
      </ErrorBoundary>
    </div>
  );
};

/**
 * Main App component with theme provider
 */
const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;

import React from 'react';

/**
 * ErrorBoundary component for catching and displaying React errors
 * Provides graceful error handling and recovery options
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error details for display
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo, this.state.errorId);
      console.warn('Error would be sent to error reporting service in production');
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <div className="error-boundary__icon">
              ⚠️
            </div>
            
            <h2 className="error-boundary__title">
              Something went wrong
            </h2>
            
            <p className="error-boundary__message">
              We're sorry, but an unexpected error occurred while rendering the dashboard.
              {this.state.errorId && (
                <span className="error-boundary__id">
                  Error ID: {this.state.errorId}
                </span>
              )}
            </p>

            <div className="error-boundary__actions">
              <button 
                className="btn btn--primary"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className="btn btn--secondary"
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>

            {isDevelopment && this.state.error && (
              <details className="error-boundary__details">
                <summary className="error-boundary__details-summary">
                  Error Details (Development Only)
                </summary>
                
                <div className="error-boundary__details-content">
                  <div className="error-boundary__section">
                    <h4>Error Message:</h4>
                    <pre className="error-boundary__message">
                      {this.state.error.toString()}
                    </pre>
                  </div>

                  <div className="error-boundary__section">
                    <h4>Component Stack:</h4>
                    <pre className="error-boundary__stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>

                  <div className="error-boundary__section">
                    <h4>Stack Trace:</h4>
                    <pre className="error-boundary__stack">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}

            {!isDevelopment && (
              <div className="error-boundary__help">
                <h3>Need Help?</h3>
                <p>
                  If this problem persists, please contact our support team with the Error ID above.
                </p>
                <div className="error-boundary__help-actions">
                  <button className="btn btn--outline">
                    Contact Support
                  </button>
                  <button className="btn btn--outline">
                    Report Issue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

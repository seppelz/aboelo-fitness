import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              textAlign: 'center',
              borderRadius: 2 
            }}
          >
            <ErrorOutlineIcon 
              sx={{ 
                fontSize: 80, 
                color: 'error.main',
                mb: 2 
              }} 
            />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
              Etwas ist schiefgelaufen
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Es ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.
            </Typography>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 1,
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: 200
                }}
              >
                <Typography variant="caption" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={this.handleReset}
                size="large"
              >
                Erneut versuchen
              </Button>
              <Button
                variant="outlined"
                onClick={this.handleReload}
                size="large"
              >
                Seite neu laden
              </Button>
            </Box>
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, CircularProgress, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Contexts
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { InstallPromptProvider } from './contexts/InstallPromptContext';

// Layout Components
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ExerciseListPage from './pages/ExerciseListPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import ProgressPage from './pages/ProgressPage';
import ProfilePage from './pages/ProfilePage';
import HelpPage from './pages/HelpPage';
import DatenschutzPage from './pages/DatenschutzPage';
import ImpressumPage from './pages/ImpressumPage';
import ContactPage from './pages/ContactPage';
import AccessibilityPage from './pages/AccessibilityPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// MUI Theme Configuration with Dark Green Color Scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2d7d7d',      // Dark teal/green
      light: '#3fa3a3',     // Lighter teal for hover states
      dark: '#1f5f5f',      // Darker green for emphasis
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff8a65',      // Warm coral/orange for contrast
      light: '#ffbb93',     // Lighter coral
      dark: '#f4511e',      // Darker coral
      contrastText: '#000000',
    },
    success: {
      main: '#4caf50',      // Green for success states
      light: '#81c784',
      dark: '#388e3c',
    },
    warning: {
      main: '#ff9800',      // Orange for warnings
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#f44336',      // Red for errors
      light: '#e57373',
      dark: '#d32f2f',
    },
    info: {
      main: '#2d7d7d',      // Use primary green for info
      light: '#3fa3a3',
      dark: '#1f5f5f',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.75rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.25rem',
    },
    h6: {
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1rem',
    },
    body2: {
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress color="primary" thickness={4} size={48} />
      </Box>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress color="primary" thickness={4} size={48} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

const LandingRoute = () => {
  const { isAuthenticated } = React.useContext(AuthContext);
  return isAuthenticated ? <Navigate to="/app" replace /> : <WelcomePage />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CustomThemeProvider>
        <AuthProvider>
          <InstallPromptProvider>
            <ErrorBoundary>
              <Router>
                <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route path="/willkommen" element={<WelcomePage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route element={<Layout disableContainer />}>
                <Route path="/help" element={<HelpPage />} />
                <Route path="/datenschutz" element={<DatenschutzPage />} />
                <Route path="/impressum" element={<ImpressumPage />} />
                <Route path="/kontakt" element={<ContactPage />} />
                <Route path="/barrierefreiheit" element={<AccessibilityPage />} />
              </Route>

              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="exercises" element={<ExerciseListPage />} />
                <Route path="exercises/:id" element={<ExerciseDetailPage />} />
                <Route path="progress" element={<ProgressPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />
                <Route path="help" element={<HelpPage />} />
                <Route path="datenschutz" element={<DatenschutzPage />} />
                <Route path="impressum" element={<ImpressumPage />} />
                <Route path="kontakt" element={<ContactPage />} />
              </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
            </ErrorBoundary>
          </InstallPromptProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}

export default App;

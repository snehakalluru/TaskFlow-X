import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './providers/QueryProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RequireAuth from './routes/RequireAuth';
import SettingsPage from './pages/SettingsPage';
import TasksPage from './pages/tasks/TasksPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import { ToastProvider } from './providers/ToastProvider';
import AppShell from './components/layout/AppShell';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<RequireAuth><AppShell><DashboardPage /></AppShell></RequireAuth>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/settings" element={<RequireAuth><AppShell><SettingsPage /></AppShell></RequireAuth>} />
              <Route path="/tasks" element={<RequireAuth><AppShell><TasksPage /></AppShell></RequireAuth>} />
              <Route path="/categories" element={<RequireAuth><AppShell><CategoriesPage /></AppShell></RequireAuth>} />
              <Route path="/notifications" element={<RequireAuth><AppShell><NotificationsPage /></AppShell></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ToastProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}



import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ShiftProvider } from './context/ShiftContext';
import { OrderTypeProvider } from './context/OrderTypeContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import TablePage from './pages/TablePage';
import LoginPage from './pages/LoginPage';
import DashboardHome from './pages/DashboardHome';
import ShiftPage from './pages/ShiftPage';
import UserProfilePage from './pages/profile/ProfilePage';
import './App.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/table" element={<TablePage />} />
                <Route path="/table/:table_code" element={<TablePage />} />
                <Route path="/table_code" element={<TablePage />} />
                <Route path="/table_code/:table_code" element={<TablePage />} />
                <Route path="/table/profile" element={<UserProfilePage backTo="/table" />} />
                <Route path="/table/:table_code/profile" element={<UserProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                
                {/* Protected Routes (Cashier Track) */}
                <Route element={<PrivateRoute />}>
                  <Route
                    element={
                      <ShiftProvider>
                        <OrderTypeProvider>
                          <Outlet />
                        </OrderTypeProvider>
                      </ShiftProvider>
                    }
                  >
                    <Route path="/dashboard/shift" element={<ShiftPage />} />
                    <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="profile" element={<UserProfilePage />} />
                    </Route>
                  </Route>
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import SchoolProfile from './pages/SchoolProfile';
import ManageSlots from './pages/ManageSlots';
import ManageServices from './pages/ManageServices';
import Account from './pages/Account';
import Register from './pages/Register';
import './index.css';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* Protected Routes */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Dashboard />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/school-profile"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <SchoolProfile />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manage-slots"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <ManageSlots />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/manage-services"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <ManageServices />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/account"
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout>
                                        <Account />
                                    </DashboardLayout>
                                </ProtectedRoute>
                            }
                        />

                        {/* Default Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

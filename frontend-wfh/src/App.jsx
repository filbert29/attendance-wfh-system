import { BrowserRouter, Routes, Route, useNavigate, Link, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { getCurrentUser, getTokenExp } from './utils/auth';
import 'antd/dist/reset.css';
import AuthLayout from './components/AuthLayout';
import AttendanceList from './pages/AttendanceList';
import Employee from './pages/Employee';
import AttendanceRequestList from './pages/AttendanceRequestList.';

const user = getCurrentUser();

function AppRoutes() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const exp = getTokenExp(token);
        if (!exp) return;

        const now = Date.now() / 1000;
        const timeout = (exp - now) * 1000;

        if (timeout <= 0) {
            localStorage.clear();
            navigate('/');
            return;
        }

        const timer = setTimeout(() => {
            localStorage.clear();
            navigate('/');
        }, timeout);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route
                element={
                    <ProtectedRoute>
                        <AuthLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/home" element={<Home />} />
                {user === 'admin' && (
                    <Route path="/employee" element={<Employee />} />
                )}
                <Route path="/attendance-list" element={<AttendanceList />} />
                <Route path="/attendance-request-list" element={<AttendanceRequestList />} />
                {/* <Route path="/profile" element={<Profile />} /> */}
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

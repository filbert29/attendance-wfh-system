import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/auth';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
        localStorage.clear();
        return <Navigate to="/" replace />;
    }

    return children;
}

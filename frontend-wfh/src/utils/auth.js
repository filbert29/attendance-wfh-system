import { jwtDecode } from 'jwt-decode';

export function getTokenExp(token) {
    try {
        const { exp } = jwtDecode(token);
        return exp;
    } catch {
        return null;
    }
}

export function isTokenExpired(token) {
    const exp = getTokenExp(token);
    if (!exp) return true;

    const now = Date.now() / 1000;
    return exp < now;
}

export const getCurrentUser = () => {
    const user = localStorage.getItem('type');
    return user;
};

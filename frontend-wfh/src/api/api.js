import axios from 'axios';

const authApi = axios.create({
    baseURL: import.meta.env.VITE_AUTH_API_URL,
});

const attendanceApi = axios.create({
    baseURL: import.meta.env.VITE_ATTENDANCE_API_URL,
});

const attachInterceptor = (instance) => {
    instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
};

attachInterceptor(authApi);
attachInterceptor(attendanceApi);

export { authApi, attendanceApi };

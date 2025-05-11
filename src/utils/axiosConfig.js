import axios from 'axios';
import Swal from 'sweetalert2';
import { BASE_URL } from '../config/api';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor - adds auth token to all requests
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles common errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        const { response } = error;

        // Handle unauthorized errors (401)
        if (response && response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            Swal.fire({
                icon: 'error',
                title: 'Session Expired',
                text: 'Your session has expired. Please login again.',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                window.location.href = '/login';
            });
        }
        
        // Handle forbidden errors (403)
        else if (response && response.status === 403) {
            Swal.fire({
                icon: 'error',
                title: 'Access Denied',
                text: 'You do not have permission to perform this action.',
                confirmButtonColor: '#3085d6'
            });
        }
        
        // Handle server errors (500)
        else if (response && response.status >= 500) {
            Swal.fire({
                icon: 'error',
                title: 'Server Error',
                text: 'Something went wrong on the server. Please try again later.',
                confirmButtonColor: '#3085d6'
            });
        }
        
        // Handle network errors
        else if (!response) {
            Swal.fire({
                icon: 'error',
                title: 'Network Error',
                text: 'Cannot connect to the server. Please check your internet connection.',
                confirmButtonColor: '#3085d6'
            });
        }

        return Promise.reject(error);
    }
);

export default axiosInstance; 
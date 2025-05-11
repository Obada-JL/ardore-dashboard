// Define backend URL from environment variables
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${BASE_URL}/api/users/login`,
    REGISTER: `${BASE_URL}/api/users/register`,
    CURRENT_USER: `${BASE_URL}/api/users/me`,
    
    // Users management
    GET_USERS: `${BASE_URL}/api/users`,
    GET_USER: (id) => `${BASE_URL}/api/users/${id}`,
    ADD_USER: `${BASE_URL}/api/users`,
    UPDATE_USER: (id) => `${BASE_URL}/api/users/${id}`,
    DELETE_USER: (id) => `${BASE_URL}/api/users/${id}`,
    
    // Messages
    GET_MESSAGES: `${BASE_URL}/api/messages`,
    GET_MESSAGE: (id) => `${BASE_URL}/api/messages/${id}`,
    UPDATE_MESSAGE: (id) => `${BASE_URL}/api/messages/${id}`,
    DELETE_MESSAGE: (id) => `${BASE_URL}/api/messages/${id}`,
    
    // Perfume endpoints
    GET_PERFUMES: `${BASE_URL}/api/perfumes`,
    GET_PERFUME: (id) => `${BASE_URL}/api/perfumes/${id}`,
    ADD_PERFUME: `${BASE_URL}/api/perfumes`,
    UPDATE_PERFUME: (id) => `${BASE_URL}/api/perfumes/${id}`,
    DELETE_PERFUME: (id) => `${BASE_URL}/api/perfumes/${id}`,
    
    // About endpoints
    GET_ABOUT: `${BASE_URL}/api/about`,
    ADD_ABOUT: `${BASE_URL}/api/about`,
    UPDATE_ABOUT: `${BASE_URL}/api/about`,
    DELETE_ABOUT: `${BASE_URL}/api/about`,
}; 
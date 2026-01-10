// Frontend API Configuration
// This file determines which backend API URL to use

// Use environment variable if available, otherwise use localhost for development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

console.log('🔗 API URL:', API_URL);

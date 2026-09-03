import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // Uses the proxy we set up
  headers: { 'Content-Type': 'application/json' }
});

// 1. Upload CSV
export const uploadFile = (formData) => API.post('/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// 2. Get Dashboard data
export const getDashboard = (uploadId) => API.get(`/dashboard/${uploadId}`);

// 3. Get Single Transaction Detail
export const getTransaction = (txnId) => API.get(`/txn/${txnId}`);

export default API;
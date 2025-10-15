import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  // Nếu backend có xác thực cookie/session thì bật dòng dưới:
  // withCredentials: true,
});

export default api;

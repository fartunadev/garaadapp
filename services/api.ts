// // services/api.ts
// import axios from 'axios';
// // import config from '../config';

// // services/api.ts
// const api = axios.create({
//   baseURL: 'http://192.168.1.100:8000', // your computer's local IP + backend port
// });

// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.100:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;


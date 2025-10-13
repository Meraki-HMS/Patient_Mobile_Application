// utils/AxiosClient.js
import axios from 'axios';

export const phoneClient = axios.create({
  baseURL: 'http://192.168.186.16:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const emailClient = axios.create({
  baseURL: 'http://192.168.186.16:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

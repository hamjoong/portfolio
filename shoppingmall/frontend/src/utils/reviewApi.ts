import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Authenticated Review Edge Function client. */
const reviewApi = axios.create({
  baseURL: supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/review` : undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(publishableKey ? { apikey: publishableKey } : {}),
  },
});

reviewApi.interceptors.request.use((config) => {
  if (!supabaseUrl || !publishableKey) {
    throw new Error('Review API 설정이 없습니다.');
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    const isPublicProductRead =
      config.method?.toUpperCase() === 'GET' && config.url?.startsWith('/product/');
    if (token && !isPublicProductRead) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default reviewApi;

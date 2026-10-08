import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Authenticated Order Edge Function client. */
const orderApi = axios.create({
  baseURL: supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/order` : undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(publishableKey ? { apikey: publishableKey } : {}),
  },
});

orderApi.interceptors.request.use((config) => {
  if (!supabaseUrl || !publishableKey) {
    throw new Error('Order API 설정이 없습니다.');
  }
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Guest mode: do not send Authorization header (avoids Supabase Gateway JWT verification error on anon key)
      delete config.headers.Authorization;
      let guestId = localStorage.getItem('shoppingmall_guest_id');
      if (!guestId) {
        guestId = `guest-${crypto.randomUUID()}`;
        localStorage.setItem('shoppingmall_guest_id', guestId);
      }
      config.headers['x-guest-id'] = guestId;
    }
  }
  return config;
});

export default orderApi;

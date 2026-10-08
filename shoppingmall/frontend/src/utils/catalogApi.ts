import axios from 'axios';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Public, read-only catalog Edge Function client. Never use a server secret here. */
const catalogApi = axios.create({
  baseURL: supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1/catalog` : undefined,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    ...(publishableKey ? { apikey: publishableKey } : {}),
  },
});

catalogApi.interceptors.request.use((config) => {
  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      'Catalog API 설정이 없습니다. NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY를 설정하세요.',
    );
  }
  return config;
});

export default catalogApi;

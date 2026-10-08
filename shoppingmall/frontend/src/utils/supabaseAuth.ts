export type SupabaseAuthSession = {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: { id: string; email?: string; email_confirmed_at?: string | null };
};

let supabaseRefreshInFlight: {
  refreshToken: string;
  promise: Promise<SupabaseAuthSession>;
} | null = null;

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)가 설정되지 않았습니다.');
  return { url, key };
}

async function authRequest<T>(path: string, body: unknown): Promise<T> {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(url + '/auth/v1/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: key },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.msg || result.message || result.error_description || 'Supabase 인증 요청에 실패했습니다.');
  }
  return result as T;
}

export function signUpSupabase(email: string, password: string, redirectTo?: string) {
  const path = redirectTo ? 'signup?redirect_to=' + encodeURIComponent(redirectTo) : 'signup';
  return authRequest<SupabaseAuthSession>(path, { email, password });
}

export function signInSupabase(email: string, password: string) {
  return authRequest<SupabaseAuthSession>('token?grant_type=password', { email, password });
}

export async function signOutSupabase(accessToken: string) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(url + '/auth/v1/logout?scope=global', {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + accessToken,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.msg || result.message || 'Supabase 로그아웃을 완료하지 못했습니다.');
  }
}

export async function getSupabaseAuthUser(accessToken: string) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(url + '/auth/v1/user', {
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + accessToken,
    },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.msg || result.message || result.error_description || 'Supabase 사용자를 확인하지 못했습니다.');
  }
  return result as SupabaseAuthSession['user'];
}

export function refreshSupabaseSession(refreshToken: string) {
  if (supabaseRefreshInFlight?.refreshToken === refreshToken) {
    return supabaseRefreshInFlight.promise;
  }

  const promise = authRequest<SupabaseAuthSession>(
    'token?grant_type=refresh_token',
    { refresh_token: refreshToken },
  ).finally(() => {
    if (supabaseRefreshInFlight?.promise === promise) {
      supabaseRefreshInFlight = null;
    }
  });
  supabaseRefreshInFlight = { refreshToken, promise };
  return promise;
}

export async function authenticatedSupabaseFetch(url: string, accessToken: string, init: RequestInit = {}) {
  const { key } = getSupabaseConfig();
  const request = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set('apikey', key);
    headers.set('Authorization', 'Bearer ' + token);
    return fetch(url, { ...init, headers, cache: 'no-store' });
  };

  const response = await request(accessToken);
  if (response.status !== 401 || typeof window === 'undefined') return response;

  const refreshToken = localStorage.getItem('supabaseRefreshToken');
  if (!refreshToken) return response;

  let refreshed: SupabaseAuthSession;
  try {
    refreshed = await refreshSupabaseSession(refreshToken);
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('supabaseRefreshToken');
    throw error;
  }
  if (!refreshed.access_token) throw new Error('Supabase 세션을 갱신하지 못했습니다.');

  localStorage.setItem('accessToken', refreshed.access_token);
  if (refreshed.refresh_token) localStorage.setItem('supabaseRefreshToken', refreshed.refresh_token);
  return request(refreshed.access_token);
}

export async function withdrawSupabaseCustomerAccount(accessToken: string) {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(url + '/functions/v1/account-withdrawal', accessToken, {
    method: 'POST',
    headers: { apikey: key },
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success !== true) {
    throw new Error(result.message || '회원탈퇴를 완료하지 못했습니다.');
  }
}

export async function saveSupabaseCustomerProfile(
  accessToken: string,
  profile: { authUserId: string; fullName: string; phoneNumber: string; address: string; detailAddress: string },
) {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(url + '/rest/v1/customer_profiles', accessToken, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      auth_user_id: profile.authUserId,
      full_name: profile.fullName,
      phone_number: profile.phoneNumber,
      address: profile.address,
      detail_address: profile.detailAddress,
    }),
    cache: 'no-store',
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.message || result.msg || '회원 프로필을 저장하지 못했습니다.');
  }
}

export async function getSupabaseCustomerProfile(accessToken: string) {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(
    url + '/rest/v1/customer_profiles?select=full_name,phone_number,address,detail_address&limit=1',
    accessToken,
    {
      headers: { apikey: key, Authorization: 'Bearer ' + accessToken },
      cache: 'no-store',
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.msg || '프로필을 불러오지 못했습니다.');
  if (!Array.isArray(result) || result.length !== 1) {
    throw new Error('회원 프로필이 아직 등록되지 않았습니다.');
  }
  return result[0] as {
    full_name: string;
    phone_number: string;
    address: string;
    detail_address: string;
  };
}

export async function updateSupabaseCustomerProfile(
  accessToken: string,
  profile: { fullName: string; phoneNumber: string; address?: string; detailAddress?: string },
) {
  const { url, key } = getSupabaseConfig();
  const update = {
    full_name: profile.fullName,
    phone_number: profile.phoneNumber,
    ...(profile.address !== undefined ? { address: profile.address } : {}),
    ...(profile.detailAddress !== undefined ? { detail_address: profile.detailAddress } : {}),
    updated_at: new Date().toISOString(),
  };
  const response = await authenticatedSupabaseFetch(
    url + '/rest/v1/customer_profiles?select=auth_user_id',
    accessToken,
    {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(update),
      cache: 'no-store',
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.msg || '프로필을 수정하지 못했습니다.');
  if (!Array.isArray(result) || result.length !== 1) {
    throw new Error('회원 프로필이 아직 등록되지 않았습니다.');
  }
  return result;
}

type SupabaseAddress = {
  id: string;
  address_name: string;
  receiver_name: string;
  phone_number: string;
  zip_code: string;
  base_address: string;
  detail_address: string;
  is_default: boolean;
};

function getSupabaseAddressUrl(baseUrl: string, addressId?: string) {
  const query = addressId
    ? '?id=eq.' + encodeURIComponent(addressId)
    : '?select=id,address_name,receiver_name,phone_number,zip_code,base_address,detail_address,is_default&order=created_at.desc';
  return baseUrl + '/rest/v1/customer_addresses' + query;
}

function getSupabaseAddressRequestBody(address: {
  addressName: string;
  receiverName: string;
  phoneNumber: string;
  zipCode: string;
  baseAddress: string;
  detailAddress: string;
  isDefault: boolean;
}) {
  return {
    p_address_name: address.addressName,
    p_receiver_name: address.receiverName,
    p_phone_number: address.phoneNumber,
    p_zip_code: address.zipCode,
    p_base_address: address.baseAddress,
    p_detail_address: address.detailAddress,
    p_is_default: address.isDefault,
  };
}

async function assertSupabaseAddressResponse(response: Response, message: string) {
  if (response.ok) return;
  const result = await response.json().catch(() => ({}));
  throw new Error(result.message || result.msg || message);
}

export async function getSupabaseCustomerAddresses(accessToken: string): Promise<SupabaseAddress[]> {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(getSupabaseAddressUrl(url), accessToken, {
    headers: { apikey: key, Authorization: 'Bearer ' + accessToken },
    cache: 'no-store',
  });
  await assertSupabaseAddressResponse(response, '배송지 목록을 불러오지 못했습니다.');
  const result = await response.json();
  if (!Array.isArray(result)) throw new Error('배송지 목록 응답 형식이 올바르지 않습니다.');
  return result as SupabaseAddress[];
}

export async function createSupabaseCustomerAddress(
  accessToken: string,
  address: Parameters<typeof getSupabaseAddressRequestBody>[0],
) {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(url + '/rest/v1/rpc/create_customer_address', accessToken, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(getSupabaseAddressRequestBody(address)),
    cache: 'no-store',
  });
  await assertSupabaseAddressResponse(response, '배송지를 등록하지 못했습니다.');
}

export async function updateSupabaseCustomerAddress(
  accessToken: string,
  addressId: string,
  address: Parameters<typeof getSupabaseAddressRequestBody>[0],
) {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(
    url + '/rest/v1/rpc/update_customer_address',
    accessToken,
    {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        p_address_id: addressId,
        ...getSupabaseAddressRequestBody(address),
      }),
      cache: 'no-store',
    },
  );
  await assertSupabaseAddressResponse(response, '배송지를 수정하지 못했습니다.');
}

export async function deleteSupabaseCustomerAddress(accessToken: string, addressId: string) {
  const { url, key } = getSupabaseConfig();
  const response = await authenticatedSupabaseFetch(getSupabaseAddressUrl(url, addressId), accessToken, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + accessToken,
      Prefer: 'return=representation',
    },
    cache: 'no-store',
  });
  await assertSupabaseAddressResponse(response, '배송지를 삭제하지 못했습니다.');
  const result = await response.json();
  if (!Array.isArray(result) || result.length !== 1) {
    throw new Error('삭제할 배송지가 없거나 본인 소유의 배송지가 아닙니다.');
  }
}

export async function requestSupabasePasswordRecovery(email: string, redirectTo: string) {
  return authRequest<Record<string, never>>(
    'recover?redirect_to=' + encodeURIComponent(redirectTo),
    { email },
  );
}

export async function updateSupabasePassword(accessToken: string, password: string) {
  const { url, key } = getSupabaseConfig();
  const response = await fetch(url + '/auth/v1/user', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: 'Bearer ' + accessToken,
    },
    body: JSON.stringify({ password }),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.msg || result.message || result.error_description || '새 비밀번호를 저장하지 못했습니다.');
  }
  return result;
}

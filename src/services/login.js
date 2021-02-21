import request from '@/utils/request';

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}
export async function getFakeCaptcha(mobile) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function doLogin(params) {
  return request('/doLogin', {
    method: 'POST',
    data: params,
  });
}

export async function doLogout() {
  return request('/logout');
}
import request from '@/utils/request';

export async function queryCurrentUser() {
  return request('/currentUser');
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
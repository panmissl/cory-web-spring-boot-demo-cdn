import request from '@/utils/request';

/* original mock api */
export async function query() {
  return request('/api/users');
}

/* original mock api */
export async function queryCurrent() {
  return request('/api/currentUser');
}

/* original mock api */
export async function queryNotices() {
  return request('/api/notices');
}

export async function queryCurrentUser() {
  return request('/currentUser');
}
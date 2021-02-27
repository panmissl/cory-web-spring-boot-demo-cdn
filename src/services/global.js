import request from '@/utils/request';

/**
 * @param {*} payload {url, pageNo, pageSize, filterParams}
 */
export async function doList(payload) {
  return request(payload.url, {
    data: {
      ...payload.filterParams,
      pageNo: payload.pageNo,
      pageSize: payload.pageSize,
    },
  });
}

export async function doCreate(payload) {
  /*
  return request('/doLogin', {
    method: 'POST',
    data: params,
  });
  */
  return null;
}

export async function doUpdate(payload) {
  //return request('/currentUser');
  return null;
}

export async function doDelete(payload) {
  //return request('/currentUser');
  return null;
}

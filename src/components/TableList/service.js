import { log } from '@/utils/utils';
import request from '@/utils/request';

/**
 * https://procomponents.ant.design/components/table#request
 * @param {*} payload {url, params(pageSize, current), sorter, filter}
 * @param {*} param1 
 * @returns {
  *    data: msg.result,
  *    // success 请返回 true，
  *    // 不然 table 会停止解析数据，即使有数据
  *    success: boolean,
  *    // 不传会使用 data 的长度，如果是分页一定要传
  *    total: number,
  * }
  */
export async function doList(payload) {
  //TODO 处理pageNo加1的情况
  const { url, params = { current: 1, pageSize: 20 }, sorter, filter = {} } = payload;
  const { current : pageNo, pageSize } = params;

  log('url: ' + url + ', pageNo: ' + pageNo + ', pageSize: ' + pageSize + ', filter: ' + JSON.stringify(filter));

  const pagination = await request(url, {
    data: {
      ...params,
      ...filter,
      pageNo,
      pageSize,
    },
  });

  log('pagination', pagination);

  //处理key
  if (pagination.list && pagination.list.length > 0) {
    let rowIndex = 1;
    pagination.list.forEach(m => m._rowIndex = rowIndex ++);
  }

  const result = {
    data: pagination.list,
    total: pagination.totalCount,
    success: true,
    pageSize,
    current: pageNo,
  };
  return result;
}

export async function doSave(payload) {
  /*
  return request('/doLogin', {
    method: 'POST',
    data: params,
  });
  */
  return null;
}

export async function doDelete(payload) {
  //return request('/currentUser');
  return null;
}
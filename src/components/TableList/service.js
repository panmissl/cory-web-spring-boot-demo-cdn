/*
import request from 'umi-request';

export async function queryRule(params) {
  return request('/api/rule', {
    params,
  });
}
export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'delete' },
  });
}
export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'post' },
  });
}
export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    data: { ...params, method: 'update' },
  });
}
*/

import { parse } from 'url';
import { log } from '@/utils/utils';
import request from '@/utils/request';

// mock tableListDataSource
const genList = (current, pageSize) => {
  const tableListDataSource = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      key: index,
      disabled: i % 6 === 0,
      href: 'https://ant.design',
      avatar: [
        'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
        'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
      ][i % 2],
      name: `TradeCode ${index}`,
      owner: '曲丽丽',
      desc: '这是一段描述',
      callNo: Math.floor(Math.random() * 1000),
      status: Math.floor(Math.random() * 10) % 4,
      updatedAt: new Date(),
      createdAt: new Date(),
      progress: Math.ceil(Math.random() * 100),
    });
  }

  tableListDataSource.reverse();
  return tableListDataSource;
};

let tableListDataSource = genList(1, 100);

function getRule(param) {
  console.log('--param', param);

  const { current = 1, pageSize = 10 } = {};
  let dataSource = [...tableListDataSource].slice((current - 1) * pageSize, current * pageSize);

  const result = {
    data: dataSource,
    total: tableListDataSource.length,
    success: true,
    pageSize,
    current: 1,
  };
  return result;
}

export async function queryRule(params) {
  return getRule(params);
}

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
      ...filter,
      pageNo,
      pageSize,
    },
  });

  log('pagination', pagination);

  const result = {
    data: pagination.list,
    total: pagination.totalCount,
    success: true,
    pageSize,
    current: pageNo,
  };
  return result;
}
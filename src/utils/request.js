/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
/*
用法：
如果有场景返回的数据不是标准结构，不需要自动解析返回数据，请求时加上此参数：rawResponse: true，就会返回原始的response
然后可以这样：response.status, response.statusText, response.json()等

注意：参数已经优化过，get和post时的参数都叫data
request.get(url[, options])
request.post(url[, options])
request.delete(url[, options])
request.put(url[, options])
request.patch(url[, options])
request.head(url[, options])
request.options(url[, options])

request
  .get('/api/v1/xxx?id=1')
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });

// 也可将 URL 的参数放到 options.data 里
request
  .get('/api/v1/xxx', {
    data: {
      id: 1,
    },
  })
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });

request
  .post('/api/v1/user', {
    data: {
      name: 'Mike',
    },
  })
  .then(function(response) {
    console.log(response);
  })
  .catch(function(error) {
    console.log(error);
  });
*/
import { extend } from 'umi-request';
import { notification } from 'antd';
import { initMeta, getPostToken, log, error } from '@/utils/utils';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * 异常处理程序
 */

const errorHandler = (e) => {
  error(e);

  const { response } = e;

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }

  return response;
};
/**
 * 配置request请求时的默认参数
 */

const request = extend({
  errorHandler,
  // 默认错误处理
  credentials: 'include', // 默认请求是否带上cookie
});

const trimData = options => {
  const { data } = options;
  if (!data) {
    return;
  }

  const keys = Object.keys(data);
  keys.forEach(key => {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      delete data[key];
    }
  });

  options.data = data;
};

request.use(async (ctx, next) => {
  const { req } = ctx;
  const { options } = req;
  const isPost = options.method.toUpperCase() == 'POST';

  trimData(options);

  if (isPost) {
    const data = {
      ...(options || {}).data || {},
      ...getPostToken(),
    };
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));

    ctx.req.options = {
      ...options || {},
      data: formData,
    };
  } else {
    ctx.req.options.params = ctx.req.options.data;
  }

  await next();

  if (isPost) {
    initMeta('post after request');
  }

  log('request: ', ctx.req, 'response: ', ctx.res);
});

request.interceptors.response.use(async (response, options) => {
  if (response.status == 401 || response.status == 403) {
    window.location.href = '/error/403';
    return null;
  }
  if (response.status >= 500) {
    window.location.href = '/error/500';
    return null;
  }

  //加了此参数的，不解析response，直接返回原始的
  if (options.rawResponse === true) {
    return response;
  }

  const data = await response.json();
  if (!data || !data.success) {
    error(JSON.stringify(data));

    notification.error({
      message: '错误',
      description: data.errorMsg,
    });
  }
  return data.object;
});

export default request;

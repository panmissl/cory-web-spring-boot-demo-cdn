import { parse } from 'querystring';
import request from '@/utils/request';
/* eslint no-useless-escape:0 import/prefer-default-export:0 */

const DEBUG = window.DEBUG_MODE || false;
const CSRF_TOKEN_NAME = "_csrf";
const FORM_TOKEN_NAME = "__form_token__";

const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;
export const isUrl = (path) => reg.test(path);
export const isAntDesignPro = () => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }

  return window.location.hostname === 'preview.pro.ant.design';
}; // 给官方演示站点用，用于关闭真实开发环境不需要使用的特性

export const isAntDesignProOrDev = () => {
  const { NODE_ENV } = process.env;

  if (NODE_ENV === 'development') {
    return true;
  }

  return isAntDesignPro();
};
export const getPageQuery = () => parse(window.location.href.split('?')[1]);

export const initMeta = () => {
  //window.document.getElementsByName('_csrf')[0].content = '123';
  //window.document.getElementsByName('__form_token__')[0].content = '123';

  request('/generateCsrfToken').then(token => {
    const csrfMetas = window.document.getElementsByName(CSRF_TOKEN_NAME);
    if (csrfMetas && csrfMetas.length > 0) {
      csrfMetas[0].content = token;
    }
  });
  request('/generateFormToken').then(token => {
    const formTokenMetas = window.document.getElementsByName(FORM_TOKEN_NAME);
    if (formTokenMetas && formTokenMetas.length > 0) {
      formTokenMetas[0].content = token;
    }
  });
};

export const getPostToken = () => {
  const csrfMetas = window.document.getElementsByName(CSRF_TOKEN_NAME);
  const formTokenMetas = window.document.getElementsByName(FORM_TOKEN_NAME);
  return {
    [CSRF_TOKEN_NAME]: (csrfMetas || [{}])[0].content,
    [FORM_TOKEN_NAME]: (formTokenMetas || [{}])[0].content,
  };
};

export const debug = fn => DEBUG && fn && fn();
export const log = msg => DEBUG && console.log(msg);
export const error = msg => DEBUG && console.error(msg);
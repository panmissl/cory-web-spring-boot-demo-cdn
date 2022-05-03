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

export const initMeta = (from) => {
  //window.document.getElementsByName('_csrf')[0].content = '123';
  //window.document.getElementsByName('__form_token__')[0].content = '123';
  log('initMeta from ' + (from ? from : 'NULL'));

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
export const log = (...msg) => DEBUG && console.log(msg);
export const error = (...msg) => DEBUG && console.error(msg);

/**
 * 获取数据字典编辑器的fieldMeta属性
 * @param {*} modelClass 后台的model类。比如：User。全称简称皆可，如果是简称会自动拼接成：com.cory.model.User
 * @param {*} fieldName model类里的属性，驼峰形式。比如：userLevel
 */
export const getDatadictFieldMeta = (modelClass, fieldName) => {
  if (!modelClass.startsWith('com.cory')) {
    modelClass = 'com.cory.model.' + modelClass;
  }
  const { modelMetaList } = window.USER;
  const modelMeta = modelMetaList.find((meta) => meta.className === modelClass);
  if (!modelMeta) {
    return null;
  }
  const { fieldList } = modelMeta;
  const field = fieldList.find(f => f.name === fieldName);
  if (!field) {
    return null;
  }
  return {
    fieldType: field.type,
    dataDictList: field.dataDictList,
    datadictTypeValue: field.datadictTypeValue,
  };
};

/**
 * 获取枚举类数据源
 * @param {*} enumClassName 枚举类型。后端定义好的，比如：UserType。全称简称皆可，如果是简称会自动拼接成：com.cory.enums.UserType。因此用户的枚举尽量也放在包：com.cory.enums下，如果是自定义包则这里要传全称。
 * @returns 
 */
export const getEnumDataSource = enumClassName => {
  if (!enumClassName.startsWith('com.cory')) {
    enumClassName = 'com.cory.enums.' + enumClassName;
  }

  const { enumMetaSet } = window.USER;
  if (!enumMetaSet || enumMetaSet.length == 0) {
    return [];
  }
  const enumMeta = enumMetaSet.find((e) => e.className == enumClassName);
  if (!enumMeta) {
    return [];
  }
  const valueLabelOrderMap = enumMeta.valueLabelOrderMap;
  if (!valueLabelOrderMap) {
    return [];
  }
  let arr = Object.keys(valueLabelOrderMap).map((value) => {
    const labelOrder = valueLabelOrderMap[value];
    const label = Object.keys(labelOrder)[0];
    const order = labelOrder[label];
    return { label, value, order };
  });
  arr = arr.sort((i1, i2) => i1.order - i2.order);
  return arr;
};

export const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};

export const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};
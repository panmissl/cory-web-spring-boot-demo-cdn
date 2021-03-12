import { log } from './utils';

const CHAR = '[a-zA-Z0-9_-]';

const isAuthorized = (menu, resource) => {
  /*
  ant path matcher 规则：https://www.cnblogs.com/songzehao/p/10854280.html
  （1）? 匹配一个字符（除过操作系统默认的文件分隔符）
  （2）* 匹配0个或多个字符
  （3）**匹配0个或多个目录
  */
  resource = resource.replace(/\?/g, CHAR);
  //有两个*和一个*，所以要按两个*分割，处理完一个*后再合并
  const arr = resource.split('**');
  for (let i=0; i<arr.length; i++) {
    //* -> [a-zA-Z0-9_-]
    arr[i] = arr[i].replace(/\*/g, CHAR + '*');
  }
  //** -> .*
  resource = arr.join('.*');
  resource = '^' + resource + '$';

  log('resource: ' + resource);

  return (new RegExp(resource)).test(menu.path);
};

/**
 * @param {*} menu { path: '', children: [menu] } children 可选
 */
const authorized = menu => {
  const resources = window.USER.resources || [];
  for (let i=0; i<resources.length; i++) {
    if (menu.path && isAuthorized(menu, resources[i])) {
      return true;
    }
    if (menu.children && menu.children.length > 0) {
      for (let m=0; m<menu.children.length; m++) {
        if (isAuthorized(menu.children[m], resources[i])) {
          return true;
        }
      }
    }
  }
  return false;
};

export const filterMenu = (menuList) => {
  if (!menuList || menuList.length == 0) {
    return menuList;
  }

  log('menuList', menuList);

  return menuList.filter(m => authorized(m));
};
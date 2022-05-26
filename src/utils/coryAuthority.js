import { PageHeader } from 'antd';
import { log } from './utils';

const CHAR = '[a-zA-Z0-9_-]';

const __isAuthorized = (path, resource) => {
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

  return (new RegExp(resource)).test(path);
};

const _isAuthorized = path => {
  if (!path) {
    return false;
  }
  const resources = (window.USER || {}).resources || [];
  if (resources.length == 0) {
    return false;
  }
  for (let i=0; i<resources.length; i++) {
    if (__isAuthorized(path, resources[i])) {
      return true;
    }
  }
  return false;
};

/**
 * @param {*} menu { path: '', children: [menu] } children 可选
 */
const authorized = menu => {
  /* 
  //如果没有二级菜单，那么看自己是否有权限即可，但如果有二级菜单，则不能看一级菜单，要看二级菜单，如果二级菜单有权限，则一级菜单显示，如果一个二级菜单都没有，则一个一级菜单都不显示
  const resources = (window.USER || {}).resources || [];
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
  */

 //不能用children判断，要用routes判断
  //如果没有二级菜单，看自己是否有权限即可
  if (menu.path && (!menu.routes || menu.routes.length == 0)) {
    return _isAuthorized(menu.path);
  }
  //有二级菜单，把有权限的二级菜单过滤出来，然后看是否二级菜单是否为空，如果为空则一级菜单也无权限，否则一级菜单有权限
  if (menu.routes && menu.routes.length > 0) {
    const newRoutes = [];
    for (let m=0; m<menu.routes.length; m++) {
      if (_isAuthorized(menu.routes[m].path)) {
        newRoutes.push(menu.routes[m]);
      }
    }
    if (newRoutes.length == 0) {
      return false;
    }
    menu.routes = newRoutes;
    return true;
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

/**
 * 场景：渲染一个带权限的组件。比如在列表页面，某个按钮只有某个权限的用户或角色才能看到。或者某个div之类的，也是一样。
 * 用法：<AuthorizedComponent path='/ajax/xxx/xxx'><Button></Button></AuthorizedComponent>
 * @param {*} props path，以/开头，用来判断是否有权限。
 * @returns 如果有权限则返回children里的内容，否则返回null
 */
export const AuthorizedComponent = props => {
  const { path } = props;
  if (path === undefined || path === null) {
    return null;
  }
  if (!_isAuthorized(path)) {
    return null;
  }
  return props.children;
};

/**
 * 判断是否有权限
 * @param path 以/开头，用来判断是否有权限。
 */
export const isAuthorized = path => _isAuthorized(path);
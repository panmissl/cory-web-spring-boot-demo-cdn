// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  history: {
    type: 'browser',
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  nodeModulesTransform: {
    type: "none",
    exclude: [],
  },
  runtimePublicPath: true,
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/',
      component: '../layouts/BlankLayout',
      routes: [
        {
          path: '/login',
          component: '../layouts/UserLayout',
          routes: [
            {
              path: '/login',
              name: '登录',
              component: './User/login',
            },
            {
              path: '/register',
              name: '注册',
              component: './User/register',
            },
          ],
        },
        {
          path: '/',
          component: '../layouts/BasicLayout',
          Routes: ['src/pages/Authorized'],
          authority: ['admin', 'user'],
          routes: [
            {
              name: 'error',
              path: '/error',
              hideInMenu: true,
              routes: [
                {
                  name: '403',
                  path: '/error/403',
                  component: './exception/403',
                },
                {
                  name: '404',
                  path: '/error/404',
                  component: './exception/404',
                },
                {
                  name: '500',
                  path: '/error/500',
                  component: './exception/500',
                },
              ],
            },
            {
              name: '首页',
              icon: 'dashboard',
              path: '/',
              component: './dashboard/workplace',
            },
            {
              name: '系统管理',
              icon: 'setting',
              routes: [
                {
                  name: '系统配置',
                  path: '/base/systemconfig',
                  component: './base/SystemConfig',
                },
                {
                  name: '数据字典',
                  path: '/base/datadict',
                  component: './base/DataDict',
                },
                {
                  name: '用户管理',
                  path: '/base/user',
                  component: './base/User',
                },
                {
                  name: '角色管理',
                  path: '/base/role',
                  component: './base/Role',
                },
                {
                  name: '资源管理',
                  path: '/base/resource',
                  component: './base/Resource',
                },
                {
                  name: '反馈管理',
                  path: '/base/feedback',
                  component: './base/Feedback',
                },
              ],
            },
            {
              redirect: '/error/404'
            },
          ],
        },
      ],
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});

export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        name: '首页',
        icon: 'home',
        path: '/',
        component: './Index',
        //redirect: '/admin',
      },
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
            redirect: '/error/404',
          },
        ],
      },
      {
        path: '/register',
        component: '../layouts/UserLayout',
        routes: [
          {
            path: '/register',
            name: '注册',
            component: './User/register',
          },
          {
            redirect: '/error/404',
          },
        ],
      },
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
          {
            redirect: '/error/404',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/BasicLayout',
        routes: [
          {
            name: '首页',
            icon: 'home',
            path: '/admin',
            component: './AdminIndex',
          },
          {
            path: '/base',
            name: '系统管理',
            icon: 'setting',
            routes: [
              {
                name: '集群管理',
                path: '/base/cluster',
                component: './base/Cluster',
              },
              {
                name: '集群任务',
                path: '/base/clusterjob',
                component: './base/ClusterJob',
              },
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
              {
                name: '操作日志',
                path: '/base/actionlog',
                component: './base/ActionLog',
              },
              {
                name: '访问统计',
                path: '/base/accesscount',
                component: './base/AccessCount',
              },
              {
                redirect: '/error/404',
              },
            ],
          },
          {
            path: '/sql',
            name: 'SQL执行',
            icon: 'consoleSql',
            routes: [
              {
                name: 'SQL执行',
                path: '/sql/execute',
                component: './sql/Sql',
              },
              {
                redirect: '/error/404',
              },
            ],
          },
          {
            path: '/demo',
            name: '测试管理',
            icon: 'desktop',
            routes: [
              {
                name: '测试配置',
                path: '/demo/demo',
                component: './demo/Demo',
              },
              {
                redirect: '/error/404',
              },
            ],
          },
          {
            redirect: '/error/404',
          },
        ],
      },
    ],
  },
  {
    redirect: '/error/404',
  },
];
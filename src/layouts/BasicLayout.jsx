/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import Footer from '@/components/Footer';
import RightContent from '@/components/GlobalHeader/RightContent';
import Authorized from '@/utils/Authorized';
import { initMeta } from '@/utils/utils';
import { filterMenu } from '@/utils/coryAutority';
import ProLayout, { SettingDrawer } from '@ant-design/pro-layout';
import { getMatchMenu } from '@umijs/route-utils';
import { Button, Result } from 'antd';
import React, { useEffect, useMemo, useRef } from 'react';
import { connect, history, Link } from 'umi';
import PageTab from './PageTab';

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="您没有权限访问此页面."
    extra={
      <Button type="primary">
        <Link to="/login">登录</Link>
      </Button>
    }
  />
);

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList) =>
  filterMenu(menuList).map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = (
  <Footer />
);

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    location = {
      pathname: '/',
    },
  } = props;

  const currentUser = window.USER;

  useEffect(() => initMeta('BasicLayout'), []);

  const menuDataRef = useRef([]);

  const authorized = useMemo(
    () =>
      getMatchMenu(location.pathname || '/', menuDataRef.current).pop() || {
        authority: undefined,
      },
    [location.pathname],
  );

  const handleMenuCollapse = (payload) => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  };

  return (
    <>
      <ProLayout
        formatMessage={null}
        {...props}
        {...settings}
        title={currentUser ? currentUser.nickName : ''}
        logo={currentUser ? currentUser.avatar : ''}
        onCollapse={handleMenuCollapse}
        onMenuHeaderClick={() => history.push('/')}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (
            menuItemProps.isUrl ||
            !menuItemProps.path ||
            location.pathname === menuItemProps.path
          ) {
            return defaultDom;
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: '首页',
          },
          ...routers,
        ]}
        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
            <span>{route.breadcrumbName}</span>
          );
        }}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        rightContentRender={() => <RightContent />}
        postMenuData={(menuData) => {
          menuDataRef.current = menuData || [];
          return menuData || [];
        }}
      >
        <Authorized authority={authorized.authority} noMatch={noMatch}>
          <PageTab>{children}</PageTab>
        </Authorized>
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={(config) =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  );
};

export default connect(({ settings }) => ({
  settings,
}))(BasicLayout);

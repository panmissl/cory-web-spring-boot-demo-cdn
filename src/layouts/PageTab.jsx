import { Tabs, Menu, Dropdown } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from 'umi';
import { CloseCircleOutlined } from '@ant-design/icons';
import routes from '../../config/routes';
import { log } from '@/utils/utils';

const { TabPane } = Tabs;

const menu = ({ pane = {}, pages = [], closeOtherTabs = () => {} }) => {
  const { pathname } = pane;
  let leftDisabled = false;
  let rightDisabled = false;
  pages.forEach((item, index) => {
    if (item.pathname === pathname) {
      if (index > pages.length - 2) {
        rightDisabled = true;
      }
      if (index === 0) {
        leftDisabled = true;
      }
    }
  });
  const menuItems = [
    {key: 'others', label: '关闭其他标签页', disabled: pages.length <= 1, handler: () => closeOtherTabs(pathname)},
    {key: 'right', label: '关闭右侧标签页', disabled: pages.length <= 1 || rightDisabled, handler: () => closeOtherTabs(pathname, 'right')},
    {key: 'left', label: '关闭左侧标签页', disabled: pages.length <= 1 || leftDisabled, handler: () => closeOtherTabs(pathname, 'left')},
  ];
  return (
    <Menu style={{ marginTop: '8px' }}>
      {menuItems.map(item => <Menu.Item key={item.key} disabled={item.disabled} onClick={item.handler}><CloseCircleOutlined />{item.label}</Menu.Item>)}
    </Menu>
  );
};

window.CORY_PAGE_TABS = [];

const _parseRoute = (routeArr, path) => {
  //routeArr: [{path: '', name: '', routes: [...]}, ...]
  for (let i=0; i<routeArr.length; i++) {
    if (path === routeArr[i].path) {
      return routeArr[i];
    }
    if (routeArr[i].routes && routeArr[i].routes.length > 0) {
      const child = _parseRoute(routeArr[i].routes, path);
      if (child) {
        return child;
      }
    }
  }
  return null;
};

const _parsePageName = path => {
  const route = _parseRoute(routes, path);
  return route ? route.name : path;
};

const _addToPageTab = component => {
  const pathname = history.location.pathname;
  const tab = CORY_PAGE_TABS.find(t => t.pathname === pathname);
  if (tab) {
    tab.component = component;
  } else {
    CORY_PAGE_TABS.push({name: _parsePageName(pathname), pathname, component});
  }
};

const PageTab = props => {
  //[{name: '', pathname: '', component: xxx}]
  const [ pages, setPages ] = useState();
  const [ activeKey, setActiveKey ] = useState();

  log('page tab', props.children, history.location.pathname);
  _addToPageTab(props.children);

  useEffect(() => {
    return history.listen(his => {
      setTimeout(() => {
        const { pathname } = his;
        log('history push', pathname);
        setPages([...CORY_PAGE_TABS]);
        setActiveKey(pathname);
      }, 0);
    });
  }, []);

  const closeOtherTabs = (pathname, direction) => {
    if (pages.length <= 1) {
      return;
    }
    if (direction === undefined) {
      CORY_PAGE_TABS = [CORY_PAGE_TABS.find(t => t.pathname === pathname)];
    } else {
      const index = CORY_PAGE_TABS.findIndex(t => t.pathname === pathname);
      direction === 'left' ? CORY_PAGE_TABS.splice(0, index) : CORY_PAGE_TABS.splice(index + 1, CORY_PAGE_TABS.length - index - 1);
    }
    setPages([...CORY_PAGE_TABS]);
  };

  const removeTab = targetKey => {
    /*
    参考chrome标签页操作，关闭当前页面时：
    1、关闭中间某一标签页，选中后一页
    2、关闭最后一页，选中前一页
    3、仅剩一页时不能关闭
    */
    const index = CORY_PAGE_TABS.findIndex(t => t.pathname === targetKey);
    const newKey = (index === (CORY_PAGE_TABS.length - 1) ? CORY_PAGE_TABS[index - 1] : index === 0 ? CORY_PAGE_TABS[1] : CORY_PAGE_TABS[index + 1]).pathname;
    CORY_PAGE_TABS.splice(index, 1);
    setPages([...CORY_PAGE_TABS]);
    setActiveKey(newKey);
  };

  return (
    <Tabs 
      hideAdd 
      activeKey={activeKey} 
      type="editable-card" 
      onEdit={removeTab}
      onTabClick={key => {
        if (key === activeKey) {
          return;
        }
        history.push(key);
      }}
    >
      {(pages || []).map(pane => {
        return (
          <TabPane
            tab={<Dropdown trigger={['contextMenu']} overlay={menu({pane, pages, closeOtherTabs})}><span>{pane.name}</span></Dropdown>}
            key={pane.pathname}
            closable={pages.length > 1}
          >
            <div className='cory-page-tab-container' key={pane.pathname}>{pane.component}</div>
          </TabPane>
        );
      })}
    </Tabs>
  );
};

export default PageTab;

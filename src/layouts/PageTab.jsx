import { Tabs, Menu, Dropdown, Button, Popconfirm, Modal, Input, Form, Spin, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { connect, history } from 'umi';
import { CloseCircleOutlined, PoweroffOutlined, FormOutlined } from '@ant-design/icons';
import routes from '../../config/routes';
import { log } from '@/utils/utils';
import request from '@/utils/request';

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

  const [ loading, setLoading ] = useState(false);
  const [ changePasswordModalVisible, setChangePasswordModalVisible ] = useState(false);
  const [ password, setPassword ] = useState();
  const [ newPassword, setNewPassword ] = useState();
  const [ passwordConfirm, setPasswordConfirm ] = useState();

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

  const doLogout = () => {
    const { dispatch } = props;
    if (dispatch) {
      dispatch({
        type: 'user/logout',
      });
    }
  };

  const changePassword = () => {
    setChangePasswordModalVisible(true);
  };

  const checkPassword = (pwd, fieldName) => {
    if (!pwd) {
      message.error(`请输入${fieldName}`);
      return false;
    }
    if (pwd.length < 6 || pwd.length > 32) {
      message.error(`${fieldName}长度在6-32个字符之间`);
      return false;
    }
    return true;
  }

  const doChangePassword = () => {
    if (!checkPassword(password, '原密码')) {
      return;
    }
    if (!checkPassword(newPassword, '新密码')) {
      return;
    }
    if (!checkPassword(passwordConfirm, '新密码确认')) {
      return;
    }
    if (newPassword !== passwordConfirm) {
      message.error('新密码和新密码确认不一致');
      return;
    }

    setLoading(true);
    log(`o: ${password}, n: ${newPassword}, c: ${passwordConfirm}`);

    const url = `${ctx}ajax/base/user/changePassword`;
    request.post(url, {data: {password, newPassword, passwordConfirm}}).then(success => {
      setLoading(false);
      if (success) {
        message.success(`密码修改成功`);
        closeChangePassword();
      } else {
        message.error(`密码修改失败`);
      }
    });
  };

  const closeChangePassword = () => {
    setChangePasswordModalVisible(false);
    setPassword(null);
    setNewPassword(null);
    setPasswordConfirm(null);
  };

  const userOpInfo = () => (
    <>
    <Button type='normal' icon={<FormOutlined />} onClick={() => changePassword()} style={{marginRight: '8px'}}>修改密码</Button>
    <Popconfirm okText="退出" title='确认退出登录?' onConfirm={() => doLogout()}><Button type='normal' icon={<PoweroffOutlined />} danger>退出登录</Button></Popconfirm>
    </>
  );

  return (
    <>
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
      tabBarExtraContent={userOpInfo()}
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
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title="修改密码"
      visible={changePasswordModalVisible}
      footer={
        <>
          <Button type="primary" onClick={() => doChangePassword()}>
            确定
          </Button>
          <Button onClick={() => closeChangePassword()}>取消</Button>
        </>
      }
      onCancel={() => closeChangePassword()}
    >
      <Spin spinning={loading}>
        <Form.Item label="原密码">
          <Input.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入原密码"
          />
        </Form.Item>
        <Form.Item label="新密码">
          <Input.Password
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="请输入新密码[长度在6-32位之间]"
          />
        </Form.Item>
        <Form.Item label="新密码确认">
          <Input.Password
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="请输入新密码确认[长度在6-32位之间]"
          />
        </Form.Item>
      </Spin>
    </Modal>
    </>
  );
};

export default connect()(PageTab);

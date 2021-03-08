import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Button, Modal, message, Radio, Card, Input } from 'antd';
import { AuditOutlined, SafetyOutlined } from '@ant-design/icons';
import request from '@/utils/request';

const radioStyle = {
  display: 'block',
  height: '30px',
  lineHeight: '30px',
};

const Page = () => {

  const [ assignRoleModalVisible, setAssignRoleModalVisible ] = useState(false);
  const [ changePasswordModalVisible, setChangePasswordModalVisible ] = useState(false);
  const [ roleList, setRoleList ] = useState([]);
  const [ currentUser, setCurrentUser ] = useState();
  const [ roleId, setRoleId ] = useState();
  const [ password, setPassword ] = useState();
  const [ actionRef, setActionRef ] = useState();

  const setupAssignRole = (user, visible, actionRef) => {
    if (user && user.id) {
      request(ctx + 'ajax/base/user/detailData/' + user.id).then(u => {
        setCurrentUser(u);
        setRoleId((((u.roles || [])[0]) || {}).id);
      });
    } else {
      setCurrentUser(null);
      setRoleId(null);
    }
    setAssignRoleModalVisible(visible);
    setActionRef(actionRef);
  };

  const setupChangePassword = (user, visible, actionRef) => {
    setCurrentUser(user);
    setPassword(null);
    setChangePasswordModalVisible(visible);
    setActionRef(actionRef);
  };

  const operationList = [
    {label: '分配角色', handler: (record, actionRef) => setupAssignRole(record, true, actionRef), type: 'normal', icon: <AuditOutlined /> },
    {label: '修改密码', handler: (record, actionRef) => setupChangePassword(record, true, actionRef), type: 'normal', icon: <SafetyOutlined /> },
  ];

  useEffect(() => {
    request(ctx + 'ajax/base/role/listData').then(pagination => setRoleList(pagination.list));
  }, []);

  const assignRole = async () => {
    const hide = message.loading('保存中...');
    const success = await request(ctx + 'ajax/base/user/doAssign', {
      method: 'POST',
      data: {
        userId: currentUser.id,
        roleId: roleId,
      },
    });
    hide();
    if (success) {
      setupAssignRole(null, false, null);
      actionRef && actionRef.current.reload();
      message.success('分配成功');
    }
  };

  const changePassword = async () => {
    const hide = message.loading('保存中...');
    const success = await request(ctx + 'ajax/base/user/changePasswordDirectly', {
      method: 'POST',
      data: {
        userId: currentUser.id,
        newPassword: password,
      },
    });
    hide();
    if (success) {
      setupChangePassword(null, false, null);
      actionRef && actionRef.current.reload();
      message.success('密码修改成功');
    }
  };
  
  return (
    <PageContainer>
      <TableList model="com.cory.model.User" showId={true} operationList={operationList} />
      
      {currentUser && <Modal
        width={640}
        bodyStyle={{padding: '32px 40px 48px'}}
        destroyOnClose
        title={`分配角色 - 手机：${currentUser.phone} 邮箱：${currentUser.email}`}
        visible={assignRoleModalVisible}
        footer={(
          <>
            <Button type="primary" onClick={() => assignRole()}>保存</Button>
            <Button onClick={() => setupAssignRole(null, false, null)}>取消</Button>
          </>
        )}
        onCancel={() => setupAssignRole(null, false, null)}
      >
        <Radio.Group onChange={e => setRoleId(e.target.value)} value={roleId}>
          {roleList.map(r => (
            <Radio style={radioStyle} value={r.id} key={r.id}>{r.name}</Radio>
          ))}
        </Radio.Group>
      </Modal>}

      {currentUser && <Modal
        width={640}
        bodyStyle={{padding: '32px 40px 48px'}}
        destroyOnClose
        title="修改密码"
        visible={changePasswordModalVisible}
        footer={(
          <>
            <Button type="primary" onClick={() => changePassword()}>保存</Button>
            <Button onClick={() => setupChangePassword(null, false, null)}>取消</Button>
          </>
        )}
        onCancel={() => setupChangePassword(null, false, null)}
      >
        <div>请输入新密码(明文密码，比如：123456)[长度在6-32位之间，前面和后面的空格会自动删除]</div>
        <Input value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入新密码(明文密码，比如：123456)[长度在6-32位之间，前面和后面的空格会自动删除]" />
      </Modal>}
    </PageContainer>
  );
};

export default Page;

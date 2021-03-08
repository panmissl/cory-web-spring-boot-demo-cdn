import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Modal, Button, Tree, message } from 'antd';
import React, { useState, useEffect } from 'react';
import { DatabaseOutlined } from '@ant-design/icons';
import { log } from '@/utils/utils';
import request from '@/utils/request';

const ROOT = {
  key: 'ALL',
  title: '全部',
};

const sortTree = node => {
  if (!node || !node.children || node.children.length == 0) {
    return;
  }
  node.children.sort((n1, n2) => n1.key.localeCompare(n2.key));
  for (let i=0; i<node.children.length; i++) {
    sortTree(node.children[i]);
  }
};

const removeFirstSlash = node => {
  let key = node.key;
  key = key.substr(1);
  let title = key;
  if (key === '') {
    key = ROOT.key;
    title = ROOT.title;
  }
  node.key = key;
  node.title = title;

  if (!node.children || node.children.length == 0) {
    return;
  }
  for (let i=0; i<node.children.length; i++) {
    removeFirstSlash(node.children[i]);
  }
};

const removeEmptyChildren = node => {
  if (!node.children) {
    return;
  }
  if (node.children.length == 0) {
    delete node.children;
    return;
  }
  for (let i=0; i<node.children.length; i++) {
    removeEmptyChildren(node.children[i]);
  }
};

const findNode = (parentNode, value) => {
  if (parentNode.key === value) {
    return parentNode;
  }
  const children = parentNode.children || [];
  for (let i=0; i<children.length; i++) {
    if (children[i].key === value) {
      return children[i];
    }
    const v = findNode(children[i], value);
    if (v) {
      return v;
    }
  }
  return null;
};

//parent 一定在tree里，只需要检查child，如果在，则返回，如果不在，则直接加在parent的children里
const addToTreeIfNeed = (tree, parent, value) => {
  const parentNode = findNode(tree, parent);
  const children = parentNode.children || [];
  if (children.find(v => v.key === value)) {
    return;
  }
  children.push({title: value, key: value, children: [],});
};

const buildTree = list => {
  if (!list || list.length == 0) {
    return {title: 'NULL', key: 'NULL'};
  }
  list = list.map(r => r.value);

  log(list);
  
  /*
  {title, key, children: [{title, key, children}]}
  */
  const tree = {title: '/', key: '/', children: []};
  list.forEach(resource => {
    // /a/b/c/d -> ["", a, b, c, d]
    const arr = resource.split('/');
    let value = "/";// arr[0];
    //第0个是空字符串，从1开始
    for (let i=1; i<arr.length; i++) {
      const parent = value;
      const child = value + '/' + arr[i];
      addToTreeIfNeed(tree, parent, child);
      value = child;
    }
  });
  //将那些空的children移除
  removeEmptyChildren(tree);
  removeFirstSlash(tree);
  sortTree(tree);

  log('tree', tree);

  return tree;
};

const isLeaf = (value, node) => {
  if (value == node.key) {
    return !node.children || node.children.length == 0;
  }
  if (!node.children || node.children.length == 0) {
    return false;
  }
  for (let i=0; i<node.children.length; i++) {
    if (isLeaf(value, node.children[i])) {
      return true;
    }
  }
  return false;
};

const Page = () => {

  const [ assignResourceModalVisible, setAssignResourceModalVisible ] = useState(false);
  //resourceTree是一个对象，ROOT NODE
  const [ resourceTree, setResourceTree ] = useState([]);
  const [ role, setRole ] = useState();
  const [ actionRef, setActionRef ] = useState();
  const [ resourceList, setResourceList ] = useState([]);
  const [ resourceObjList, setResourceObjList ] = useState([]);

  const setupAssignResource = (role, visible, actionRef) => {
    if (role && role.id) {
      request(ctx + 'ajax/base/role/detailData/' + role.id).then(r => {
        const list = r.resources || [];
        setRole(r);
        setResourceList(list.map(r => r.value));
      });
    } else {
      setRole(null);
      setResourceList([]);
    }
    setAssignResourceModalVisible(visible);
    setActionRef(actionRef);
  };

  const operationList = [
    {label: '分配资源', handler: (record, actionRef) => setupAssignResource(record, true, actionRef), type: 'normal', icon: <DatabaseOutlined /> },
  ];

  useEffect(() => {
    request(ctx + 'ajax/base/resource/listData', {data: {pageSize: 100000}}).then(pagination => {
      setResourceTree(buildTree(pagination.list));
      setResourceObjList(pagination.list);
    });
  }, []);

  const assignResource = async () => {
    const hide = message.loading('保存中...');
    
    const list = resourceList.filter(r => isLeaf(r, resourceTree));
    if (!list || list.length == 0) {
      hide();
      message.warning('请先选择资源!');
      return;
    }

    const data = {};
    let index = 0;
    list.forEach(r => {
      data[`roleResourceRelList[${index}].roleId`] = role.id;
      data[`roleResourceRelList[${index}].resourceId`] = resourceObjList.find(obj => obj.value == r).id;
      index ++;
    });

    const success = await request(ctx + 'ajax/base/role/doAssign', {
      method: 'POST',
      data,
    });
    hide();
    if (success) {
      setupAssignResource(null, false, null);
      actionRef && actionRef.current.reload();
      message.success('分配成功');
    }
  };

  const onCheck = checkedKeys => setResourceList(checkedKeys);

  return (
    <PageContainer>
      <TableList model="com.cory.model.Role" showId={true} operationList={operationList} />

      {role && <Modal
        width={640}
        bodyStyle={{padding: '32px 40px 48px'}}
        destroyOnClose
        title={`分配资源 - 角色：${role.name}`}
        visible={assignResourceModalVisible}
        footer={(
          <>
            <Button type="primary" onClick={() => assignResource()}>保存</Button>
            <Button onClick={() => setupAssignResource(null, false, null)}>取消</Button>
          </>
        )}
        onCancel={() => setupAssignResource(null, false, null)}
      >
        <Tree
          checkable
          autoExpandParent={true}
          onCheck={onCheck}
          checkedKeys={resourceList}
          treeData={[resourceTree]}
          defaultExpandedKeys={[ROOT.key]}
        />
      </Modal>}
    </PageContainer>
  );
};

export default Page;

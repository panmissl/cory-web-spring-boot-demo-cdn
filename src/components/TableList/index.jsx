import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer, Popconfirm } from 'antd';
import React, { useState, useRef, useMemo, Fragment } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateForm from './UpdateForm';
import { doList, doSave, doDelete } from './service';
import { log } from '@/utils/utils';
import { parsePageInfo, processValues } from './Helper';

//表单文档：https://procomponents.ant.design/components/table/#search-%E6%90%9C%E7%B4%A2%E8%A1%A8%E5%8D%95

const DEFAULT_PAGINATION = {
  show: true,
  pageSize: 20,
  current: 1,
};

const handleSave = async (record, pageInfo) => {
  log('handle save', record, pageInfo);

  const hide = message.loading('保存中...');

  const success = await doSave({
    url: pageInfo.saveUrl,
    data: record,
  });

  hide();
  if (success) {
    message.success('保存成功');
  }
  return success;
};

const handleDelete = async (id, actionRef, pageInfo) => {
  const hide = message.loading('正在删除');

  const success = await doDelete({
    url: pageInfo.deleteUrl,
    id,
  });

  hide();
  if (success) {
    message.success('删除成功');
    if (actionRef.current) {
      actionRef.current.reset();
    }
  }
  return success;
};

/**
 * props: 
 *     model="com.cory.model.Resource" mandatory
 *     params={{sort: 'VALUE DESC'}} default null
 *     pageSize=20 default 20
 *     ellipsisFieldList=['code', 'name'] default null 对于太长的字段，用这个来显示...并把宽度限制
 *     operationList=[{type: 'normal/danger/warning', label: '', execute: fn(record)}, ...]} default null 自定义操作，可以有多个。
 *     showId=true/false 是否显示ID字段，默认不显示
 */
const TableList = (props) => {
  const [editModal, setEditModal] = useState({visible: false, isCreate: false, record: null, });
  const actionRef = useRef();
  const [row, setRow] = useState();
  
  const pageInfo = useMemo(() => parsePageInfo(props, setEditModal, handleDelete, actionRef, setRow), []);

  return (
    <Fragment>
      <ProTable
        //headerTitle="查询表格"
        pagination={{
          ...DEFAULT_PAGINATION,
          pageSize: props.pageSize || DEFAULT_PAGINATION.pageSize,
        }}
        actionRef={actionRef}
        rowKey="_rowIndex"
        /*
        search={{
          labelWidth: 120,
        }}
        */
        params={props.params || {}}
        search={pageInfo.searchEnable}
        toolBarRender={() => pageInfo.createable ? [
          <Button type="primary" onClick={() => setEditModal({visible: true, isCreate: true, record: null, })}>
            <PlusOutlined /> 新建
          </Button>,
        ] : []}
        request={(params, sorter, filter) => doList({ url: pageInfo.listUrl, params, sorter, filter: processValues(filter, pageInfo.listColumns)})}
        columns={pageInfo.listColumns}
      />

      {(pageInfo.createable || pageInfo.updateable) && editModal.visible && (
      <UpdateForm 
        onSubmit={async (value) => {
          const success = await handleSave(value, pageInfo);

          if (success) {
            setEditModal({ visible: false, record: null });
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => setEditModal({ visible: false, record: null })}
        editModalVisible={editModal.visible} 
        title={(editModal.isCreate ? '新建' : '编辑') + pageInfo.name}
        columns={pageInfo.editColumns}
        values={editModal.record}/>
      )}

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={true}
      >
        <ProDescriptions
          column={1}
          title={pageInfo.name}
          request={async () => ({
            data: row || {},
          })}
          params={{
            id: row?.id,
          }}
          columns={pageInfo.detailColumns}
        />
      </Drawer>
    </Fragment>
  );
};

export default TableList;

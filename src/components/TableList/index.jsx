import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer, Popconfirm } from 'antd';
import React, { useState, useRef, useMemo, Fragment } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import UpdateForm from './UpdateForm';
import { doList, doSave, doDelete } from './service';
import { log } from '@/utils/utils';

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

const parsePageInfo = ({ model, ellipsisFieldList = [], operationList = [], showId = false }, setEditModal, actionRef) => {
  const { modelMetaList } = window.USER;
  const modelMeta = modelMetaList.find(meta => meta.className == model);
  const { name, module, createable, updateable, deleteable, fieldList } = modelMeta;

  const baseUrl = '/ajax/' + module.toLowerCase() + '/' + (model.substr(model.lastIndexOf('.') + 1)).toLowerCase();
  const listUrl = baseUrl + '/listData';
  const saveUrl = baseUrl + '/save';
  const deleteUrl = baseUrl + '/delete/';

  const c = (field) => ({
    fieldType: field.type,
    fieldJavaType: field.javaType,
    fieldNullable: field.nullable,
    fieldLen: field.len,

    title: field.label,
    tooltip: field.desc && field.desc.length > 0 ? field.desc : null,
    dataIndex: field.name,
    valueType: 'text',
    search: field.filtered,
    ellipsis: ellipsisFieldList.indexOf(field.name) >= 0,
    renderText: (val, record) => {
      return field.renderName && field.renderName.length > 0 ? (record && record.renderFieldMap ? record.renderFieldMap[field.renderName] : '') : val;
    },
  });

  const listColumns = fieldList.filter(f => f.showable).map(field => c(field));
  const editColumns = fieldList.filter(f => f.showable && f.editable).map(field => c(field));
  const detailColumns = fieldList.filter(f => f.showable).map(field => c(field));

  if (showId) {
    listColumns.splice(0, 0, c({
      label: 'ID',
      name: 'id',
      filtered: false,
    }));
  }

  editColumns.splice(0, 0, c({
    label: 'ID',
    name: 'id',
    hideInForm: true,
  }));

  let opArr = [];
  if (updateable) {
    opArr.push({
      execute: record => setEditModal({visible: true, isCreate: false, record, }),
      label: '编辑',
    });
  }
  if (deleteable) {
    opArr.push({
      type: 'danger',
      execute: record => handleDelete(record.id, actionRef, pageInfo),
      label: '删除',
      confirm: true,
      confirmText: '确认删除?',
    });
  }
  if (operationList.length > 0) {
    opArr = opArr.concat(operationList);
  }
  if (opArr.length > 0) {
    listColumns.push({
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        let opIndex = 1;
        return opArr.map(op => {
          if (op.confirm) {
            return (
              <Popconfirm
                key={opIndex ++}
                title={op.confirmText}
                onConfirm={() => op.execute(record)}
                //onCancel={cancel}
                okText="确认"
                cancelText="取消">
                  <Button type={op.type || 'normal'}>{op.label}</Button>
              </Popconfirm>
            );
          }
          return <Button key={opIndex ++} type={op.type || 'normal'} onClick={() => op.execute(record)}>{op.label}</Button>;
        });
      },
    });
  }

  const searchEnable = fieldList.filter(f => f.filtered).length > 0;

  detailColumns.push(c({
    label: '创建时间',
    name: 'createTime',
    filtered: false,
    renderName: 'createTimeText',
  }));
  detailColumns.push(c({
    label: '最后更新时间',
    name: 'modifyTime',
    filtered: false,
    renderName: 'modifyTimeText',
  }));

  const pageInfo = {
    name,
    listUrl,
    saveUrl,
    deleteUrl,
    listColumns,
    editColumns,
    detailColumns,
    filters: [],
    validation: [],
    searchEnable,
    createable, 
    updateable, 
    deleteable,
  };

  log('pageInfo', pageInfo);

  return pageInfo;
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
  
  const pageInfo = useMemo(() => parsePageInfo(props, setEditModal, actionRef), []);

  //详情链接
  pageInfo.listColumns[0].render = (dom, entity) => {
    return <a onClick={() => setRow(entity)}>{dom}</a>;
  };

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
        request={(params, sorter, filter) => doList({ url: pageInfo.listUrl, params, sorter, filter})}
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

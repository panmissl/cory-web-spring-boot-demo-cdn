import { PlusOutlined } from '@ant-design/icons';
import { Button, Divider, message, Input, Drawer } from 'antd';
import React, { useState, useRef, useMemo, Fragment } from 'react';
import { PageContainer, FooterToolbar } from '@ant-design/pro-layout';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import CreateForm from './CreateForm';
import UpdateForm from './UpdateForm';
import { doList, doSave, doDelete } from './service';
import { log } from '@/utils/utils';

const DEFAULT_PAGINATION = {
  show: true,
  pageSize: 20,
  current: 1,
};

const handleSave = async (record) => {

  //const hide = message.loading('正在配置');

  /*
  try {
    await updateRule({
      name: fields.name,
      desc: fields.desc,
      key: fields.key,
    });
    hide();
    message.success('配置成功');
    return true;
  } catch (error) {
    hide();
    message.error('配置失败请重试！');
    return false;
  }
  */
};

const handleDelete = async (id, actionRef) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  /*
  try {
    await removeRule({
      key: selectedRows.map((row) => row.key),
    });
    hide();
    message.success('删除成功，即将刷新');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
  */
};

const parsePageInfo = ({ model, ellipsisFieldList = [], operationList = [], showId = false }, setEditModal, actionRef) => {
  const { modelMetaList } = window.USER;
  const modelMeta = modelMetaList.find(meta => meta.className == model);
  const { name, module, createable, updateable, deleteable, fieldList } = modelMeta;

  const baseUrl = '/ajax/' + module.toLowerCase() + '/' + (model.substr(model.lastIndexOf('.') + 1)).toLowerCase();
  const listUrl = baseUrl + '/listData';
  const updateUrl = baseUrl + '/save';
  const deleteUrl = baseUrl + '/delete/';

  const c = (field) => ({
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
      execute: record => handleDelete(record.id, actionRef),
      label: '删除',
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
        return opArr.map(op => <Button key={opIndex ++} type={op.type || 'normal'} onClick={() => op.execute(record)}>{op.label}</Button>);
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
    updateUrl,
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
      <CreateForm 
        onCancel={() => setEditModal({visible: false})} 
        modalVisible={editModal.visible} 
        title={(editModal.isCreate ? '新建' : '编辑') + pageInfo.name}>
        <ProTable
          onSubmit={async (value) => {
            const success = await handleAdd(value);

            if (success) {
              handleModalVisible(false);

              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="_rowIndex"
          type="form"
          columns={pageInfo.editColumns}
          request={async () => ({
            data: editModal.record || {},
          })}
        />
      </CreateForm>
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

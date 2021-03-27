import { log } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, message, Upload, Tooltip } from 'antd';
import React, { Fragment, useMemo, useRef, useState } from 'react';
import { parsePageInfo, processValues } from './Helper';
import { doDelete, doList, doSave } from './service';
import EditForm from './Form';

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
 * https://ant.design/components/tag-cn/
 * https://procomponents.ant.design/components/table#columns-%E5%88%97%E5%AE%9A%E4%B9%89
 * https://pro.ant.design/index-cn
 * 
 * actionRef的方法：actionRef.current.reload(), actionRef.current.reset()
 * 
 * props: 
 *     model="com.cory.model.Resource" mandatory
 *     params={{sort: 'VALUE DESC'}} default null
 *     pageSize=20 default 20
 *     ellipsisFieldList=['code', 'name'] default null 对于太长的字段，用这个来显示...并把宽度限制
 *     operationList=[{label: '', handler: fn(record, actionRef), type: 'primary | normal | dashed | text', danger: true/false, icon: xx, loading: true/false}, ...]} default null 自定义操作，可以有多个。
 *     showId=true/false 是否显示ID字段，默认不显示
 *     listRenderer: {column1: renderer, column2: renderer} renderer的参数：(value, record)
 *     editRenderer: {column1: renderer, column2: renderer} renderer的参数：column。字段相关选项。来源于window.USER.modelMetaList。参见Helper.renderColumn
 *     toolbar: [{label: '', handler: (actionRef) => {}, type: 'primary | normal | dashed | text', danger: true/false, loading: true/false, icon: <SearchOutlined />, tooltip: String(可选), upload: true/false, uploadProps: {}}] 操作按钮列表，和“新建”放一起。如果指定了upload为true，则输出Upload组件包裹，实现文件上传，此时需要属性uploadProps，具体值见官网文档，onChange的回调里，除了官方的文档里的参数外，会另外加一个actionRef的参数，用来刷新列表
 * 
 * toolbar上传例子：注意onChange里成功后的刷新
  const [uploadLoading, setUploadLoading] = useState(false);

  const uploadProps = {
    name: 'file',
    showUploadList: false,
    action: '/ajax/guess/idiomquestion/upload',
    beforeUpload: () => setUploadLoading(true),
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        setUploadLoading(false);
        message.success(`上传成功`);
        info.actionRef.current.reset();
      } else if (info.file.status === 'error') {
        message.error(`上传失败.`);
        setUploadLoading(false);
      }
    },
  };

  const toolbar = [{
    label: '上传问题',
    handler: () => {},
    type: 'primary',
    icon: <CloudUploadOutlined />,
    upload: true,
    uploadProps,
    loading: uploadLoading,
  }];
 */
const TableList = (props) => {
  const [editModal, setEditModal] = useState({visible: false, isCreate: false, record: null, });
  const actionRef = useRef();
  const [row, setRow] = useState();
  
  const pageInfo = useMemo(() => parsePageInfo(props, setEditModal, handleDelete, actionRef, setRow), []);

  const toolbar = [];
  let toolbarIndex = 1;
  if (pageInfo.createable) {
    toolbar.push((
      <Button key={toolbarIndex++} type="primary" onClick={() => setEditModal({visible: true, isCreate: true, record: null, })}>
        <PlusOutlined /> 新建
      </Button>
    ));
  }
  if (props.toolbar && props.toolbar.length > 0) {
    props.toolbar.forEach(button => {
      //需要：button.upload, button.uploadProps，onChange的回调里，除了官方的文档里的参数外，会另外加一个actionRef的参数，用来刷新列表
      if (button.upload) {
        //传递actionRef参数
        const uploadProps = button.uploadProps || {};
        const oriOnChange = uploadProps.onChange || (() => {});
        uploadProps.onChange = info => oriOnChange({...info, actionRef});
        toolbar.push((
          <Upload {...uploadProps}>
            {button.tooltip ? (
              <Tooltip title={button.tooltip}>
                <Button key={toolbarIndex++} type={button.type} danger={button.danger || false} loading={button.loading || false} icon={button.icon}>
                  {button.label}
                </Button>
              </Tooltip>
            ) : (
              <Button key={toolbarIndex++} type={button.type} danger={button.danger || false} loading={button.loading || false} icon={button.icon}>
                {button.label}
              </Button>
            )}
          </Upload>
        ));
      } else {
        toolbar.push(
          button.tooltip ? (
            <Tooltip title={button.tooltip}>
              <Button key={toolbarIndex++} type={button.type} onClick={() => button.handler(actionRef)} danger={button.danger || false} loading={button.loading || false} icon={button.icon}>
                {button.label}
              </Button>
            </Tooltip>
          ) : (
            <Button key={toolbarIndex++} type={button.type} onClick={() => button.handler(actionRef)} danger={button.danger || false} loading={button.loading || false} icon={button.icon}>
              {button.label}
            </Button>
          )
        );
      }
    });
  }

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
        toolBarRender={() => toolbar}
        request={(params, sorter, filter) => doList({ url: pageInfo.listUrl, params, sorter, filter: processValues(filter, pageInfo.listColumns)})}
        columns={pageInfo.listColumns}
      />

      {(pageInfo.createable || pageInfo.updateable) && editModal.visible && (
      <EditForm 
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

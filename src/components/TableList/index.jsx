import { log } from '@/utils/utils';
import { PlusOutlined } from '@ant-design/icons';
import ProDescriptions from '@ant-design/pro-descriptions';
import ProTable from '@ant-design/pro-table';
import { Button, Drawer, message, Upload, Tooltip, Popconfirm } from 'antd';
import React, { Fragment, useMemo, useRef, useState, useEffect } from 'react';
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
 *     params={{sort: 'VALUE DESC'}} default null 还可以加其它初始化固定参数，比如只查状态为init的，可以添加：status: 'init'
 *     pageSize=20 default 20
 *     ellipsisFieldList=['code', 'name'] default null 对于太长的字段，用这个来显示...并把宽度限制
 *     operationList=[{label: '', show: fn(record) => return true/false, handler: fn(record, actionRef), type: 'primary | normal | dashed | text', danger: true/false, icon: xx, loading: true/false, confirm: true/false, confirmText: ''}, ...]} default null 自定义操作，可以有多个。show方法定义了是否显示，比如某个状态下显示，其它状态不显示
 *     showId=true/false 是否显示ID字段，默认不显示
 *     filterById=true/false 是否显示ID字段的过滤，默认不显示。在showId为true时才生效
 *     showCreateTime=true/false 是否在列表显示创建时间字段，默认不显示
 *     showModifyTime=true/false 是否在列表显示最后更新时间字段，默认不显示
 *     listRenderer: {column1: renderer, column2: renderer} renderer的参数：(value, record)。
 *     detailRenderer: {column1: renderer, column2: renderer} renderer的参数：(value, record)。默认情况detail和list一样，如果不同可以指定，优先级最高
 *     editRenderer: {column1: renderer, column2: renderer} renderer的参数：column。字段相关选项。来源于window.USER.modelMetaList。参见Helper.renderColumn。如果renderer传false，则不显示此字段，提交时也不会提交此字段
 *     filterRenderer: {column1: {renderer, transform(可选)}, column2: {renderer, transform(可选)}} renderer的参数：(item, config, form)。config: { type, defaultRender, formItemProps, fieldProps, ...rest }, transform的参数：value: any，返回{key1: val1, key2: val2}，用来转换输入得到的值。renderer注意事项：如果里面要用动态的数据，比如远程加载数据渲染成Select的下拉列表，需要用useRef来保存，不能用useState，见下方的示例。官方文档：https://procomponents.ant.design/components/table/?current=1&pageSize=5#%E6%90%9C%E7%B4%A2%E8%A1%A8%E5%8D%95%E8%87%AA%E5%AE%9A%E4%B9%89
 *     filterFieldMap: {c1: true/false} 为true则加过滤，为false则不加过滤。优先级比@Field里设置的高
 *     hideInListFieldList: [column1, column2]。列表不显示此字段(只是列表，详情还是要显示的)
 *     extraFieldInList: 列表额外的显示字段，显示那些模型里没有定义的字段，比如模型里定义了姓名和年龄字段，但需要显示电话字段。会加在现有字段后面，但放在操作字段前面。{column1: {label: 'xxx', renderer: () => xxx}, column2: {label: 'xxx', renderer: () => xxx}} renderer的参数：(value, record)。
 *     extraFieldInDetail: 详情额外的显示字段，显示那些模型里没有定义的字段，比如模型里定义了姓名和年龄字段，但需要显示电话字段，{column1: {label: 'xxx', renderer: () => xxx}, column2: {label: 'xxx', renderer: () => xxx}} renderer的参数：(value, record)。
 *     labels: {column1: 'label1', column2: 'label2'} 自定义字段的label。优先级比@Field里设置的高
 *     toolbar: [{label: '', handler: (actionRef) => {}, type: 'primary | normal | dashed | text', danger: true/false, loading: true/false, icon: <SearchOutlined />, tooltip: String(可选，有confirm时会被忽略), upload: true/false, uploadProps: {}, confirm: true/false(可选，有upload时会被忽略), confirmText: ''}] 操作按钮列表，和“新建”放一起。如果指定了upload为true，则输出Upload组件包裹，实现文件上传，此时需要属性uploadProps，具体值见官网文档，onChange的回调里，除了官方的文档里的参数外，会另外加一个actionRef的参数，用来刷新列表
 *     createable: 是否可新建。优先级比@Model里设置的高
 *     updateable: 是否可修改。优先级比@Model里设置的高
 *     deleteable: 是否可删除。优先级比@Model里设置的高
 *     reset: 从外部控制重新加载列表：页码跳回第一页。它是一个数字，当数字变化时重新加载。使用示例：一开始设置为1，需要重新加载时，将其加1。可选，如果不从外部控制重新加载不用设置。
 *     reload: 从外部控制重新加载列表：使用当前页码。它是一个数字，当数字变化时重新加载。使用示例：一开始设置为1，需要重新加载时，将其加1。可选，如果不从外部控制重新加载不用设置。
 *     richText: 是否富文本编辑器。优先级比@Model里设置的高
 *     //忽略此行：uploadHandler 可选。有富文本编辑器，且需要上传文件时必须要，否则上传文件会报错。richText为true时需要。参数(参见：RichEditor)：object: {file(文件体), progress(Fn(int progress)), libraryId(String), success(Fn(res))[res须为一个包含已上传文件url属性的对象], error(Fn(err))}
 *     uploadHandler 可选。有富文本编辑器，且需要上传文件时必须要，否则上传文件会报错。richText为true时需要。两个参数：file: 上传的文件，successCallback(url)：上传成功后，回调到系统里，系统做处理（添加到富文本里），参数是url。一般可以用OssUploader导出的uploadToOss方法即可
 *     proTableProps 可选。ProTable的原生属性参数，会传递到ProTable上面。比如需要可以嵌套的表格时，就可以设置expandable属性
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
    confirm: true, 
    confirmText: '',
  }];

  filterRenderer示例：两个例子：一个是日期选择框，但提交时需要将日期转为月份，此时要用transform，一个是下拉列表，需要远程加载列表为下拉数据，此时要用useRef
  
  const selectListRef = useRef();
  
  useEffect(() => {
    request.get(`${ctx}ajax/xx/xx/listData?pageSize=1000`).then(p => selectListRef.current = p.list);
  }, []);

  return (
    <TableList 
      model="com.cory.model.Xxx" 
      showId={true} 
      filterRenderer={{
        xxxId: {
          renderer: () => <Select placeholder="请选择">{(selectListRef.current || []).map(e => <Option key={e.id} value={e.id}>{e.name}</Option>)}</Select>,
        },
        month: {
          renderer: () => <DatePicker picker="month" />,
          transform: val => ({month: val ? val.substr(0, 7) : val}),
        },
      }}
    />
  );

  filterRenderer示例 - END
 */
const TableList = (props) => {
  const [editModal, setEditModal] = useState({ visible: false, isCreate: false, record: null });
  const actionRef = useRef();
  const [row, setRow] = useState();

  const pageInfo = useMemo(
    () => parsePageInfo(props, setEditModal, handleDelete, actionRef, setRow),
    [],
  );

  const toolbar = [];
  let toolbarIndex = 1;

  const { updateable, reset, reload, proTableProps } = props;
  let { createable } = props;
  if (createable === undefined || createable === null) {
    createable = pageInfo.createable;
  }

  if (createable) {
    toolbar.push(
      <Button
        key={toolbarIndex++}
        type="primary"
        onClick={() => setEditModal({ visible: true, isCreate: true, record: null })}
      >
        <PlusOutlined /> 新建
      </Button>,
    );
  }
  if (props.toolbar && props.toolbar.length > 0) {
    props.toolbar.forEach((button) => {
      //需要：button.upload, button.uploadProps，onChange的回调里，除了官方的文档里的参数外，会另外加一个actionRef的参数，用来刷新列表
      if (button.upload) {
        //传递actionRef参数
        const uploadProps = button.uploadProps || {};
        const oriOnChange = uploadProps.onChange || (() => {});
        uploadProps.onChange = (info) => oriOnChange({ ...info, actionRef });
        toolbar.push(
          <Upload {...uploadProps}>
            {button.tooltip ? (
              <Tooltip title={button.tooltip}>
                <Button
                  key={toolbarIndex++}
                  type={button.type}
                  danger={button.danger || false}
                  loading={button.loading || false}
                  icon={button.icon}
                >
                  {button.label}
                </Button>
              </Tooltip>
            ) : (
              <Button
                key={toolbarIndex++}
                type={button.type}
                danger={button.danger || false}
                loading={button.loading || false}
                icon={button.icon}
              >
                {button.label}
              </Button>
            )}
          </Upload>,
        );
      } else if (button.confirm) {
        toolbar.push((
          <Popconfirm
            key={toolbarIndex++}
            title={button.confirmText}
            onConfirm={() => button.handler(actionRef)}
            //onCancel={cancel}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type={button.type || 'normal'}
              danger={button.danger || false}
              loading={button.loading || false}
              icon={button.icon}
            >
              {button.label}
            </Button>
          </Popconfirm>
        ));
      } else {
        toolbar.push(
          button.tooltip ? (
            <Tooltip title={button.tooltip}>
              <Button
                key={toolbarIndex++}
                type={button.type || 'normal'}
                onClick={() => button.handler(actionRef)}
                danger={button.danger || false}
                loading={button.loading || false}
                icon={button.icon}
              >
                {button.label}
              </Button>
            </Tooltip>
          ) : (
            <Button
              key={toolbarIndex++}
              type={button.type}
              onClick={() => button.handler(actionRef)}
              danger={button.danger || false}
              loading={button.loading || false}
              icon={button.icon}
            >
              {button.label}
            </Button>
          ),
        );
      }
    });
  }

  useEffect(() => {
    log('reset changed', reset);
    if (actionRef && actionRef.current && actionRef.current.reset) {
      actionRef.current.reset();
    }
  }, [reset]);

  useEffect(() => {
    log('reload changed', reload);
    if (actionRef && actionRef.current && actionRef.current.reload) {
      actionRef.current.reload();
    }
  }, [reload]);

  return (
    <Fragment>
      <ProTable 
        {...(proTableProps || {})}
        //headerTitle="查询表格"
        pagination={{
          //...DEFAULT_PAGINATION, 不能放这个，否则分页会失效，why?
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
        request={(params, sorter, filter) =>
          doList({
            url: pageInfo.listUrl,
            params: processValues(params, pageInfo.listColumns),
            sorter,
          })
        }
        columns={pageInfo.listColumns}
      />

      {(createable || updateable) && editModal.visible && (
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
          values={editModal.record}
        />
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

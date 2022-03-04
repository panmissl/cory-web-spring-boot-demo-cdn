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
 *     params={{sort: 'VALUE DESC'}} default null 还可以加其它初始化固定参数，比如只查状态为init的，可以添加：status: 'init'
 *     pageSize=20 default 20
 *     ellipsisFieldList=['code', 'name'] default null 对于太长的字段，用这个来显示...并把宽度限制
 *     operationList=[{label: '', show: fn(record) => return true/false, handler: fn(record, actionRef), type: 'primary | normal | dashed | text', danger: true/false, icon: xx, loading: true/false, confirm: true/false, confirmText: ''}, ...]} default null 自定义操作，可以有多个。show方法定义了是否显示，比如某个状态下显示，其它状态不显示
 *     showId=true/false 是否显示ID字段，默认不显示
 *     listRenderer: {column1: renderer, column2: renderer} renderer的参数：(value, record)。
 *     editRenderer: {column1: renderer, column2: renderer} renderer的参数：column。字段相关选项。来源于window.USER.modelMetaList。参见Helper.renderColumn。如果renderer传false，则不显示此字段，提交时也不会提交此字段
 *     editLabel: {column1: label1, column2: label2}。可选。设置表单的label
 *     filterFieldMap: {c1: true/false} 为true则加过滤，为false则不加过滤。优先级比@Field里设置的高
 *     hideInListFieldList: [column1, column2]。列表不显示此字段(只是列表，详情还是要显示的)
 *     toolbar: [{label: '', handler: (actionRef) => {}, type: 'primary | normal | dashed | text', danger: true/false, loading: true/false, icon: <SearchOutlined />, tooltip: String(可选), upload: true/false, uploadProps: {}}] 操作按钮列表，和“新建”放一起。如果指定了upload为true，则输出Upload组件包裹，实现文件上传，此时需要属性uploadProps，具体值见官网文档，onChange的回调里，除了官方的文档里的参数外，会另外加一个actionRef的参数，用来刷新列表
 *     createable: 是否可新建。优先级比@Model里设置的高
 *     updateable: 是否可修改。优先级比@Model里设置的高
 *     deleteable: 是否可删除。优先级比@Model里设置的高
 *     richText: 是否富文本编辑器。优先级比@Model里设置的高
 *     code: 是否代码编辑器。优先级比@Model里设置的高
 *     //忽略此行：uploadHandler 可选。有富文本编辑器，且需要上传文件时必须要，否则上传文件会报错。richText为true时需要。参数(参见：RichEditor)：object: {file(文件体), progress(Fn(int progress)), libraryId(String), success(Fn(res))[res须为一个包含已上传文件url属性的对象], error(Fn(err))}
 *     uploadHandler 可选。有富文本编辑器，且需要上传文件时必须要，否则上传文件会报错。richText为true时需要。两个参数：file: 上传的文件，successCallback(url)：上传成功后，回调到系统里，系统做处理（添加到富文本里），参数是url。一般可以用OssUploader导出的uploadToOss方法即可。用法见下面的例子
 *     formValueInitializer：可选。form表单值初始化处理。比如要添加一些字段或者处理一些初始化值。是一个函数，接收初始化数据，返回处理过的初始化数据: Fn(initValues) => processedInitValues。一般要配合editRenderer使用，把某个字段重新赋值后重新渲染，然后提交时再处理回来
 *     formValuePostProcessor：可选。form表单提交前处理器。比如在提交前对一些值进行处理或转换。是一个函数，接收要提交的数据，返回处理过的提交数据: Fn(submitValues) => processedSubmitValues。一般要配合editRenderer使用，把某个字段重新赋值后重新渲染，然后提交时再处理回来
 *     rule: 可选。表单校验规则: {column1: [rule1, rule2], column2: [rule3, rule4]}，优先级比@Field 里设置的高，如果设置为false则不校验。规则就是校验的规则，参考antd文档
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

  uploadHandler用法举例：
  1、先引入uploadToOss：
  import { uploadToOss } from '@/components/OssUploader';
  2、在TableList里传入uploadHandler：
  <TableList 
    model="com.cory.model.XXX" 
    showId={false} 
    uploadHandler={(file, callback) => {
      uploadToOss(OSS_TYPE_XXX, file, (success, url) => {
        //上传成功，回调一下，不成功忽略
        if (success) {
          callback(url);
        }
      });
    }}
  />


  级联菜单：
  使用级联菜单比较麻烦，要结合formValueInitializer、formValuePostProcessor、rule、editLabel、editRenderer，以及antd的级联菜单组件Cascader一起使用。
  举例：现在有两个字段：一级菜单ID(level1CategoryId)、二级菜单ID(level2CategoryId)，要用级联菜单的方式选择一级菜单后，再动态加载二级菜单数据，然后选择。同时编辑时要填充两菜菜单的初始数据。
  原理：编辑表单不显示二级菜单ID，同时把一级菜单ID自定义渲染，然后在提交时将数据写回去一级菜单ID和二级菜单ID

  formValueInitializer和formValuePostProcessor用来处理初始化数据和提交的数据，
  rule用来处理校验：一级菜单ID本来是一个数字，现在是一个数组了，所以校验要改掉
  editLabel用来处理显示列的标题，现在用做级联菜单，那么标题应该叫：分类
  完整代码如下：

  //动态加载远程分类数据：根据parentId加载，parentId为0时加载的是一级分类
  const loadCategory = (parentId, callback) => request.get(ctx + 'ajax/app/category/ListByParentId', {data: {parentId}}).then(list => callback && callback(list));

  //自定义的级联菜单编辑器
  const CategoryEditor = props => {
    if (!props) {
      return;
    }
    //value: [l1Id, l2Id]
    const { value, onChange } = props;

    log('category editor', value);

    //[{value: '', label: '', children: []}]
    const [ options, setOptions ] = useState();

    //初始化时加载一级菜单
    useEffect(() => loadCategory(0, list => {
      const newOps = (list || []).map(c => ({label: c.name, value: c.id, isLeaf: c.isLeaf}));
      //如果有初始值，且有二级菜单，那么加载二级菜单
      if (value && value.length > 1) {
        loadCategory(value[0], subList => {
          ((newOps || []).find(o => o.value === value[0]) || {}).children = (subList || []).map(c => ({label: c.name, value: c.id, isLeaf: c.isLeaf}));
          log('options', newOps);
          setOptions(newOps);
        });
      } else {
        setOptions(newOps);
      }
    }), []);

    const loadData = selectedOptions => {
      const targetOption = selectedOptions[selectedOptions.length - 1];
      targetOption.loading = true;

      loadCategory(targetOption && targetOption.value ? targetOption.value : 0, list => {
        targetOption.loading = false;
        targetOption.children = (list || []).map(c => ({label: c.name, value: c.id, isLeaf: c.isLeaf}));
        setOptions([...options]);
      });
    };

    const triggerChange = v => {
      log('change', v);
      onChange(v);
    };

    return <Cascader options={options} value={value} loadData={loadData} onChange={triggerChange} changeOnSelect />;
  };

  const processInitValues = values => {
    if (!values) {
      values = {};
    }
    const level1CategoryId = values.level1CategoryId;
    //如果已经是数组了，那就是打开的编辑窗口关闭后再打开的，值还没变，直接返回
    if (level1CategoryId && Array.isArray(level1CategoryId)) {
      return values;
    }

    values.level1CategoryId = null;
    if (level1CategoryId) {
      values.level1CategoryId = [level1CategoryId, values.level2CategoryId || 0];
    }
    log('processInitValues', level1CategoryId, values.level1CategoryId);
    return values;
  };

  const processSubmitValues = values => {
    const categoryIdArr = values.level1CategoryId || [];
    values.level1CategoryId = categoryIdArr.length > 0 ? categoryIdArr[0] : 0;
    values.level2CategoryId = categoryIdArr.length > 1 ? categoryIdArr[1] : 0;
    return values;
  };
  <TableList 
    model="com.cory.model.Article" 
    showId={false} 
    formValueInitializer={values => processInitValues(values)}
    formValuePostProcessor={values => processSubmitValues(values)}
    editRenderer={{level1CategoryId: () => <CategoryEditor />, level2CategoryId: false, code: false, viewCount: false, hot: false, isIndexed: false}}
    listRenderer={{code: v => <Tooltip title={v}>{v.substr(0, 8)}</Tooltip>, level1CategoryId: (v, r) => r.l1Category ? r.l1Category.name : '无', level2CategoryId: (v, r) => r.l2Category ? r.l2Category.name : '无',}}
    hideInListFieldList={['link', 'logo', 'description', 'content', 'codeContent']}
    editLabel={{level1CategoryId: '分类'}}
    rule={{level1CategoryId: [{ required: true, message: '请选择分类！', }]}}
  />
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

  const { updateable, formValueInitializer, formValuePostProcessor } = props;

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
      } else {
        toolbar.push(
          button.tooltip ? (
            <Tooltip title={button.tooltip}>
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
            if (formValuePostProcessor) {
              log('before form value post processor', value);
              value = formValuePostProcessor(value);
              log('after form value post processor', value);
            }
            log('submit form', value);
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
          values={formValueInitializer ? formValueInitializer(editModal.record) : editModal.record}
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

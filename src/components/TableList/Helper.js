import { log } from '@/utils/utils';
import { DeleteOutlined, EditOutlined, DownOutlined } from '@ant-design/icons';
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  notification,
  Popconfirm,
  Radio,
  Select,
  Menu,
  Dropdown,
} from 'antd';
import RichEditor, { initRichEditorValue } from '@/components/RichEditor';
import moment from 'moment';
import React from 'react';
import DatadictEditor from '@/components/form/DatadictEditor';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

const COLUMN_TYPE = {
  INT: 'INT',
  BIGINT: 'BIGINT',
  DOUBLE: 'DOUBLE',
  VARCHAR: 'VARCHAR',
  TEXT: 'TEXT',
  BOOLEAN: 'BOOLEAN',
  DATETIME: 'DATETIME',
  ENUM: 'ENUM',
  DATE: 'DATE',
};

const _renderOpColumnsAsDropDown = (opArr, record, actionRef, pageInfo) => {
  let opIndex = 1;
  const menu = (
    <Menu>
      {opArr.map((op) => {
        if (op.confirm) {
          return (
            <Popconfirm
              key={opIndex++}
              okText="确认"
              title={op.confirmText}
              onConfirm={() => op.handler(record, actionRef, pageInfo)}
            >
              <Menu.Item icon={op.icon} danger={op.danger || false}>
                {op.label}
              </Menu.Item>
            </Popconfirm>
          );
        }
        return (
          <Menu.Item
            key={opIndex++}
            icon={op.icon}
            danger={op.danger || false}
            onClick={() => op.handler(record, actionRef, pageInfo)}
          >
            {op.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
  return (
    <Dropdown overlay={menu}>
      <Button>
        操作 <DownOutlined />
      </Button>
    </Dropdown>
  );
};

/**
 * 根据字段类型返回字段提示：选择 / 输入
 * @param {*} type 字段类型，见：COLUMN_TYPE
 */
const requireTip = (type) => {
  if (
    type == COLUMN_TYPE.BOOLEAN ||
    type == COLUMN_TYPE.ENUM ||
    type == COLUMN_TYPE.DATETIME ||
    type == COLUMN_TYPE.DATE
  ) {
    return '选择';
  }
  return '输入';
};

/**
 * 利用enumMetaSet构造枚举选项：如果字段类型不是枚举则返回空
 * @param {*} fieldJavaType 字段Java类型，比如：java.lang.String, java.lang.Integer等
 */
const buildEnumOptions = (fieldJavaType, isValueEnum) => {
  const enumMetaSet = window.USER.enumMetaSet;
  if (!enumMetaSet || enumMetaSet.length == 0) {
    return null;
  }
  const enumMeta = enumMetaSet.find((e) => e.className == fieldJavaType);
  if (!enumMeta) {
    return null;
  }
  const valueLabelOrderMap = enumMeta.valueLabelOrderMap;
  if (!valueLabelOrderMap) {
    return null;
  }
  let arr = Object.keys(valueLabelOrderMap).map((value) => {
    const labelOrder = valueLabelOrderMap[value];
    const label = Object.keys(labelOrder)[0];
    const order = labelOrder[label];
    return { label, value, order };
  });
  arr = arr.sort((i1, i2) => i1.order - i2.order);
  log('arr', arr);

  if (isValueEnum) {
    const obj = {};
    arr.forEach((item) => (obj[item.value] = { text: item.label, status: 'Default' }));
    return obj;
  }
  return arr.map((item) => (
    <Option key={item.value} value={item.value}>
      {item.label}
    </Option>
  ));
};

/**
 * 根据字段类型返回字段输入框。比如文本返回输入框，枚举返回下拉框
 * @param {*} column 字段定义：{ filedType, title, fieldLen, fieldJavaType, richText, uploadHandler(richText为true时需要) }
 */
const renderColumnInput = (column) => {
  if (column.datadictTypeValue && column.datadictTypeValue.length > 0) {
    return <DatadictEditor fieldMeta={column} />;
  }
  if (
    column.fieldType == COLUMN_TYPE.INT ||
    column.fieldType == COLUMN_TYPE.BIGINT ||
    column.fieldType == COLUMN_TYPE.DOUBLE
  ) {
    return <InputNumber disabled={!column.updateable} style={{ width: '100%' }} placeholder={`请输入${column.title}`} />;
  }
  if (column.fieldType == COLUMN_TYPE.VARCHAR && column.fieldLen <= 500) {
    return <Input placeholder={`请输入${column.title}`} disabled={!column.updateable} />;
  }
  if (
    column.fieldType == COLUMN_TYPE.TEXT &&
    (column.richText === true || column.richText === 'true')
  ) {
    return (
      <RichEditor placeholder={`请输入${column.title}`} uploadHandler={column.uploadHandler} />
    );
  }
  if (
    column.fieldType == COLUMN_TYPE.TEXT ||
    (column.fieldType == COLUMN_TYPE.VARCHAR && column.fieldLen > 500)
  ) {
    return <TextArea rows={4} disabled={!column.updateable} placeholder={`请输入${column.title}`} />;
  }
  if (column.fieldType == COLUMN_TYPE.BOOLEAN) {
    return (
      <RadioGroup disabled={!column.updateable}>
        <Radio value="true">是</Radio>
        <Radio value="false">否</Radio>
      </RadioGroup>
    );
  }
  if (column.fieldType == COLUMN_TYPE.DATETIME) {
    return (
      <DatePicker
        style={{
          width: '100%',
        }}
        showTime={true}
        format="YYYY-MM-DD HH:mm:ss"
        placeholder="请选择"
        disabled={!column.updateable}
      />
    );
  }
  if (column.fieldType == COLUMN_TYPE.DATE) {
    return (
      <DatePicker
        style={{
          width: '100%',
        }}
        showTime={false}
        format="YYYY-MM-DD"
        placeholder="请选择"
        disabled={!column.updateable}
      />
    );
  }
  if (column.fieldType == COLUMN_TYPE.ENUM) {
    return (
      <Select
        style={{
          width: '100%',
        }}
        disabled={!column.updateable}
      >
        {buildEnumOptions(column.fieldJavaType)}
      </Select>
    );
  }
  notification.error({
    message: '错误',
    description: `不支持的类型：${column.fieldType}`,
  });
  return null;
};

/**
 * 渲染字段
 * @param {*} column 字段相关选项。来源于window.USER.modelMetaList
 */
const renderColumn = (column) => {
  /*
    fieldType: field.type, //INT,BIGINT,DOUBLE,VARCHAR,TEXT,BOOLEAN,DATETIME,ENUM,
    fieldJavaType: field.javaType,
    fieldNullable: field.nullable,
    fieldLen: field.len,
    richText: field.richText,
    datadictTypeValue: field.datadictTypeValue,
    uploadHandler: field.uploadHandler,//richText为true时需要

    title: field.label,
    tooltip: field.desc && field.desc.length > 0 ? field.desc : null,
    dataIndex: field.name,
    valueType: 'text',
    search: field.filtered,
    ellipsis: ellipsisFieldList.indexOf(field.name) >= 0,
    renderText: (val, record) => {
        return field.renderName && field.renderName.length > 0 ? (record && record.renderFieldMap ? record.renderFieldMap[field.renderName] : '') : val;
    },
    */

  if (column.dataIndex == 'id') {
    return null;
  }

  //rule START
  const rules = [];
  if (false === column.fieldNullable) {
    rules.push({
      required: true,
      message: `请${requireTip(column.fieldType)}${column.title}！`,
    });
  }
  if (column.fieldType == COLUMN_TYPE.VARCHAR && column.fieldLen > 0) {
    rules.push({
      max: column.fieldLen,
      message: `最大长度为${column.fieldLen}！`,
    });
  }
  if (column.fieldType == COLUMN_TYPE.INT || column.fieldType == COLUMN_TYPE.BIGINT) {
    rules.push({
      type: 'integer',
      message: `请输入数字！`,
    });
  }
  if (column.fieldType == COLUMN_TYPE.DOUBLE) {
    rules.push({
      type: 'number',
      message: `请输入数字！`,
    });
  }
  //rule END

  return (
    <FormItem
      key={column.dataIndex}
      name={column.dataIndex}
      label={column.title}
      rules={rules}
      tooltip={column.tooltip}
    >
      {column.customEditRenderer ? column.customEditRenderer(column) : renderColumnInput(column)}
    </FormItem>
  );
};

const parseValueType = (fieldType, fieldLen) => {
  //https://procomponents.ant.design/components/table/#valuetype-%E5%80%BC%E7%B1%BB%E5%9E%8B
  //Date,dateTime,dateRange,dateTimeRange,time,
  //text,select,textarea,digit
  if (
    fieldType == COLUMN_TYPE.INT ||
    fieldType == COLUMN_TYPE.BIGINT ||
    fieldType == COLUMN_TYPE.DOUBLE
  ) {
    return 'digit';
  }
  if (fieldType == COLUMN_TYPE.VARCHAR && fieldLen <= 500) {
    return 'text';
  }
  if (fieldType == COLUMN_TYPE.TEXT || (fieldType == COLUMN_TYPE.VARCHAR && fieldLen > 500)) {
    return 'textarea';
  }
  if (fieldType == COLUMN_TYPE.BOOLEAN || fieldType == COLUMN_TYPE.ENUM) {
    return 'select';
  }
  if (fieldType == COLUMN_TYPE.DATETIME) {
    return 'dateTime';
  }
  if (fieldType == COLUMN_TYPE.DATE) {
    return 'date';
  }
  return 'text';
};

const parseValueEnum = (field) => {
  const valueType = parseValueType(field.type, field.len);
  if (valueType != 'select') {
    return null;
  }
  if (field.type == COLUMN_TYPE.BOOLEAN) {
    return {
      yes: {
        text: '是',
        status: 'Default',
      },
      no: {
        text: '否',
        status: 'Default',
      },
    };
  }
  if (field.type == COLUMN_TYPE.ENUM) {
    return buildEnumOptions(field.javaType, true);
  }
  return null;
};

const _isFilterEnable = (enableFromPage, enableFromField) => {
  //如果页面已经设置了过滤，则优先级最高，直接显示过滤
  if (enableFromPage === true) {
    return true;
  }
  if (enableFromPage === false) {
    return false;
  }
  //页面没有设置，用字段上设置的
  return enableFromField;
};

const _renderRichText = (value, record, field) => (
  <div dangerouslySetInnerHTML={{ __html: value }} style={{ display: 'inline-block' }} />
);

/**
 * uploadHandler 有富文本编辑器，且需要上传文件时必须要，否则上传文件会报错。richText为true时需要。一般可以用OssUploader导出的uploadToOss方法即可
 * filterFieldMap: {c1: true/false} 为true则加过滤，为false则不加过滤。优先级比@Field里设置的高
 * hideInListFieldList: [column1, column2]。列表不显示此字段(只是列表，详情还是要显示的)
 * @param {*} param { model, ellipsisFieldList = [], operationList = [], showId = false, listRenderer = {}, editRenderer = {}, filterFieldMap = {}, hideInListFieldList, updateable: updateableFirst, deleteable: deleteableFirst, uploadHandler = null }
 * @param {*} handleEditClick 点击编辑按钮时的处理器，参数：{visible: true, isCreate: false, record, }
 * @param {*} handleDelete 点击删除时的处理器，参数：{id, actionRef, pageInfo, }
 * @param {*} actionRef
 * @param {*} detailHandler 详情点击时的处理器，参数为record，就是一条记录
 */
const parsePageInfo = (
  {
    model,
    ellipsisFieldList = [],
    operationList = [],
    showId = false,
    listRenderer = {},
    editRenderer = {},
    filterFieldMap = {},
    hideInListFieldList = [],
    updateable: updateableFirst,
    deleteable: deleteableFirst,
    uploadHandler = null,
  },
  handleEditClick,
  handleDelete,
  actionRef,
  detailHandler,
) => {
  const { modelMetaList } = window.USER;
  const modelMeta = modelMetaList.find((meta) => meta.className == model);
  const {
    name,
    module,
    createable,
    updateable: updateableModel,
    deleteable: deleteableModel,
    fieldList,
  } = modelMeta;

  //优先使用JS传过来的
  const updateable =
    updateableFirst === undefined || updateableFirst === null ? updateableModel : updateableFirst;
  const deleteable =
    deleteableFirst === undefined || deleteableFirst === null ? deleteableModel : deleteableFirst;

  const modelBigName = model.substr(model.lastIndexOf('.') + 1);
  //const modelSmallName = modelBigName.substr(0, 1).toLowerCase() + modelBigName.substr(1);
  //const baseUrl = '/ajax/' + module.toLowerCase() + '/' + modelSmallName;
  const baseUrl = '/ajax/' + module.toLowerCase() + '/' + modelBigName.toLowerCase();
  const listUrl = baseUrl + '/listData';
  const saveUrl = baseUrl + '/save';
  const deleteUrl = baseUrl + '/delete/';

  const c = (field) => {
    const result = {
      fieldType: field.type,
      fieldJavaType: field.javaType,
      fieldNullable: field.nullable,
      updateable: field.updateable,
      fieldLen: field.len,
      richText: field.richText,
      datadictTypeValue: field.datadictTypeValue,
      dataDictList: field.dataDictList,
      uploadHandler: uploadHandler,
      customEditRenderer: editRenderer[field.name],
      customListRenderer: listRenderer[field.name],
  
      title: field.label,
      tooltip: field.desc && field.desc.length > 0 ? field.desc : null,
      dataIndex: field.name,
      valueType: parseValueType(field.type, field.len),
      valueEnum: parseValueEnum(field),
      hideInSearch: !_isFilterEnable(filterFieldMap[field.name], field.filtered),
      ellipsis: ellipsisFieldList.indexOf(field.name) >= 0,
    };

    if (field.datadictTypeValue && field.datadictTypeValue.length > 0) {
      result.renderFormItem = () => <DatadictEditor fieldMeta={field} />;
    }

    if (listRenderer[field.name]) {
      result.render = (v, r) => listRenderer[field.name](v, r);
    } else if (field.richText === true || field.richText === 'true') {
      result.render = (value, record) => _renderRichText(value, record, field);
    } else if (field.renderName && field.renderName.length > 0) {
      result.render = (v, record) => record && record.renderFieldMap ? (record.renderFieldMap[field.renderName] || '') : '';
    }
    
    return result;
  };

  const listColumns = fieldList
    .filter((f) => f.showable && hideInListFieldList.indexOf(f.name) < 0)
    .map((field) => c(field));
  const editColumns = fieldList
    .filter((f) => f.showable && f.updateable && editRenderer[f.name] !== false)
    .map((field) => c(field));
  const detailColumns = fieldList.filter((f) => f.showable).map((field) => c(field));

  if (showId) {
    listColumns.splice(
      0,
      0,
      c({
        label: 'ID',
        name: 'id',
        filtered: false,
      }),
    );
  }

  //列表列的时间和日期列：做成期间选择器: {index: 1, column: c}
  const rangeColumns = [];
  listColumns.forEach((c, index) => {
    //如果不搜索，则不用处理
    if (c.hideInSearch) {
      return;
    }
    if (c.valueType == 'date' || c.valueType == 'dateTime') {
      c.hideInSearch = true;
      rangeColumns.push({
        index: index,
        column: {
          ...c,
          hideInTable: true,
          hideInSearch: false,
          dataIndex: c.dataIndex + 'Range',
          valueType: c.valueType == 'date' ? 'dateRange' : 'dateTimeRange',
          search: {
            transform: (value) => {
              return {
                [c.dataIndex + 'Start']: value[0],
                [c.dataIndex + 'End']: value[1],
              };
            },
          },
        },
      });
    }
  });
  if (rangeColumns.length > 0) {
    rangeColumns.forEach(({ column, index }) => listColumns.splice(index, 0, column));
  }

  editColumns.splice(
    0,
    0,
    c({
      label: 'ID',
      name: 'id',
      hideInForm: true,
    }),
  );

  listColumns.push({
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    render: (_, record) => {
      let opArr = [];
      if (operationList.length > 0) {
        opArr = opArr.concat(operationList.filter(op => {
          if (!op.show) {
            return true;
          }
          return op.show(record);
        }));
      }
      if (updateable) {
        opArr.push({
          handler: (record) => handleEditClick({ visible: true, isCreate: false, record }),
          label: '编辑',
          icon: <EditOutlined />,
        });
      }
      if (deleteable) {
        opArr.push({
          type: 'primary',
          danger: true,
          handler: (record) => handleDelete(record.id, actionRef, pageInfo),
          label: '删除',
          confirm: true,
          confirmText: '确认删除?',
          icon: <DeleteOutlined />,
        });
      }

      //多个渲染成下拉，单个才做按钮
      if (opArr.length === 0) {
        return '无';
      }
      if (opArr.length > 1) {
        return _renderOpColumnsAsDropDown(opArr, record, actionRef, pageInfo);
      } else {
        let opIndex = 1;
        return opArr.map((op) => {
          if (op.confirm) {
            return (
              <Popconfirm
                key={opIndex++}
                title={op.confirmText}
                onConfirm={() => op.handler(record, actionRef, pageInfo)}
                //onCancel={cancel}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  type={op.type || 'normal'}
                  danger={op.danger || false}
                  loading={op.loading || false}
                  icon={op.icon}
                >
                  {op.label}
                </Button>
              </Popconfirm>
            );
          }

          return (
            <Button
              key={opIndex++}
              type={op.type || 'normal'}
              onClick={() => op.handler(record, actionRef, pageInfo)}
              danger={op.danger || false}
              loading={op.loading || false}
              icon={op.icon}
            >
              {op.label}
            </Button>
          );
        });
      }
    },
  });

  const searchEnable = fieldList.filter((f) => f.filtered).length > 0;

  detailColumns.push(
    c({
      label: '创建时间',
      name: 'createTime',
      filtered: false,
      renderName: 'createTimeText',
    }),
  );
  detailColumns.push(
    c({
      label: '最后更新时间',
      name: 'modifyTime',
      filtered: false,
      renderName: 'modifyTimeText',
    }),
  );

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

  //详情链接
  pageInfo.listColumns[0].render = (dom, entity) => {
    return <a onClick={() => detailHandler(entity)}>{dom}</a>;
  };

  log('pageInfo', pageInfo);

  return pageInfo;
};

const _getType = (name, columns) => {
  const c = columns.find((c) => c.dataIndex == name);
  return c && c.fieldType ? c.fieldType : null;
};

const _isRichText = (name, columns) => {
  const c = columns.find((c) => c.dataIndex == name);
  if (!c) {
    return false;
  }
  return c.richText === true || c.richText === 'true';
};

/**
 * 转换值，目前主要是对以下类型的处理，后续有其他需要再加：
 * 字符串类型转为时间类型
 * 将富文本类型值初始化
 * @param {*} values 列值
 * @param {*} columns 列定义
 */
const convertValues = (values, columns = []) => {
  if (!values) {
    return values;
  }

  const obj = {};
  Object.keys(values).forEach((key) => {
    const type = _getType(key, columns);
    const richText = _isRichText(key, columns);
    let value = values[key];
    if (value && type && (type == COLUMN_TYPE.DATETIME || type == COLUMN_TYPE.DATE)) {
      value = moment(value);
    } else if (type == COLUMN_TYPE.BOOLEAN) {
      value = value === true ? 'true' : 'false';
    }
    if (richText) {
      value = initRichEditorValue(value);
    }

    obj[key] = value;
  });

  log('values', values, 'columns', columns, 'obj', obj);

  return obj;
};

/**
 * 处理对象值，目前主要是对以下类型的处理，后续有其他需要再加：
 * 时间类型：格式化
 * 布尔类型：转为true，false
 * 富广本类型：转为html
 * @param {*} obj 表单值
 * @param {*} columns 列定义
 */
const processValues = (obj, columns) => {
  if (!obj) {
    return obj;
  }

  Object.keys(obj).forEach((key) => {
    const type = _getType(key, columns);
    const richText = _isRichText(key, columns);
    let value = obj[key];
    if (value && value._isAMomentObject) {
      obj[key] = value.format('YYYY-MM-DD HH:mm:ss');
    }
    if (value && type && type == COLUMN_TYPE.BOOLEAN) {
      obj[key] = value === 'true' ? true : false;
    }
    if (value && richText) {
      obj[key] = value.toHTML();
    }
    if (value && value.trim) {
      obj[key] = value.trim();
    }

    //最后，移除undefined的属性
    if (obj[key] === undefined || obj[key] === null || obj[key] === '') {
      delete obj[key];
    }
  });
  return obj;
};

export { renderColumn, parsePageInfo, convertValues, processValues, COLUMN_TYPE };

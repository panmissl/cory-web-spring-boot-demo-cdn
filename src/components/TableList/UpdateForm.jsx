import { Button, DatePicker, Form, Input, Modal, notification, Radio, Select, Steps, InputNumber } from 'antd';
import React, { useState } from 'react';
import { log } from '@/utils/utils';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const formLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 13,
  },
};

const requireTip = type => {
  //INT,BIGINT,DOUBLE,VARCHAR,TEXT,BOOLEAN,DATETIME,ENUM,
  if (type == 'BOOLEAN' || type == 'ENUM' || type == 'DATETIME') {
    return '选择';
  }
  return '输入';
};

const buildEnumOptions = fieldJavaType => {
  const enumMetaSet = window.USER.enumMetaSet;
  if (!enumMetaSet || enumMetaSet.length == 0) {
    return null;
  }
  const enumMeta = enumMetaSet.find(e => e.className == fieldJavaType);
  if (!enumMeta) {
    return null;
  }
  const valueLabelOrderMap = enumMeta.valueLabelOrderMap;
  if (!valueLabelOrderMap) {
    return null;
  }
  let arr = Object.keys(valueLabelOrderMap).map(value => {
    const labelOrder = valueLabelOrderMap[value];
    const label = Object.keys(labelOrder)[0];
    const order = labelOrder[label];
    return {label, value, order};
  });
  arr = arr.sort((i1, i2) => i1.order - i2.order);
  log('arr', arr);
  return arr.map(item => (<Option key={item.value} value={item.value}>{item.label}</Option>));
};

const renderColumnInput = column =>{
  if (column.fieldType == 'INT' || column.fieldType == 'BIGINT' || column.fieldType == 'DOUBLE') {
    return (
      <InputNumber placeholder={`请输入${column.title}`} />
    );
  }
  if (column.fieldType == 'VARCHAR' && column.fieldLen <= 500) {
    return (
      <Input placeholder={`请输入${column.title}`} />
    );
  }
  if (column.fieldType == 'TEXT' || (column.fieldType == 'VARCHAR' && column.fieldLen > 500)) {
    return (
      <TextArea rows={4} placeholder={`请输入${column.title}`} />
    );
  }
  if (column.fieldType == 'BOOLEAN') {
    return (
      <RadioGroup>
        <Radio value="yes">是</Radio>
        <Radio value="no">否</Radio>
      </RadioGroup>
    );
  }
  if (column.fieldType == 'DATETIME') {
    return (
      <DatePicker
        style={{
          width: '100%',
        }}
        showTime={false}
        format="YYYY-MM-DD"
        placeholder="请选择"
      />
    );
  }
  if (column.fieldType == 'ENUM') {
    return (
      <Select
        style={{
          width: '100%',
        }}
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

const renderColumn = column => {
  /*
  fieldType: field.type, //INT,BIGINT,DOUBLE,VARCHAR,TEXT,BOOLEAN,DATETIME,ENUM,
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
  if (column.fieldType == 'VARCHAR' || column.fieldType == 'TEXT' && column.fieldLen > 0) {
    rules.push({
      max: column.fieldLen,
      message: `最大长度为${column.fieldLen}！`,
    });
  }
  if (column.fieldType == 'INT' || column.fieldType == 'BIGINT') {
    rules.push({
      type: 'integer',
      message: `请输入数字！`,
    });
  }
  if (column.fieldType == 'DOUBLE') {
    rules.push({
      type: 'number',
      message: `请输入数字！`,
    });
  }
  //rule END

  return (
    <FormItem key={column.dataIndex} name={column.dataIndex} label={column.title} rules={rules} tooltip={column.tooltip}>
      {renderColumnInput(column)}
    </FormItem>
  );
};

/**
 * 
 * @param {*} props {onSubmit, onCancel, eidtModalVisible, title, columns, values}
 */
const EditForm = (props) => {
  const [formVals, setFormVals] = useState({
    ...props.values,
  });
  const [form] = Form.useForm();
  const {
    onSubmit,
    onCancel,
    editModalVisible,
    title,
    columns,
    values,
  } = props;

  log('values', values);

  const handleSave = async () => {
    const fieldsValue = await form.validateFields();
    log('fieldsValue', fieldsValue);

    //把原始的字段都带回去，因为后端不会再取了
    const data = {...props.values, ...fieldsValue};
    if (data.filterFieldMap) {
      delete data.filterFieldMap;
    }
    if (delete data.renderFieldMap) {
      delete data.renderFieldMap;
    }
    onSubmit(data);
  };

  const renderFooter = () => {
    return (
      <>
        <Button type="primary" onClick={() => handleSave()}>保存</Button>
        <Button onClick={() => onCancel()}>取消</Button>
      </>
    );
  };

  return (
    <Modal
      width={640}
      bodyStyle={{
        padding: '32px 40px 48px',
      }}
      destroyOnClose
      title={title}
      visible={editModalVisible}
      footer={renderFooter()}
      onCancel={() => onCancel()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          ...formVals,
        }}
      >
        {columns.map(column => renderColumn(column))}
      </Form>
    </Modal>
  );
};

export default EditForm;

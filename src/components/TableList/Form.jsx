import { log } from '@/utils/utils';
import { Button, Form, Modal } from 'antd';
import React, { useState } from 'react';
import { convertValues, processValues, renderColumn } from './Helper';

const formLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 18,
  },
};

/**
 * 
 * @param {*} props {onSubmit, onCancel, eidtModalVisible, title, columns, values}
 */
const EditForm = (props) => {
  const values = convertValues(props.values, props.columns);

  const [formVals, setFormVals] = useState({
    ...values,
  });
  const [form] = Form.useForm();
  const {
    onSubmit,
    onCancel,
    editModalVisible,
    title,
    columns,
  } = props;

  const handleSave = async () => {
    const fieldsValue = processValues(await form.validateFields(), columns);
    
    log('fieldsValue', fieldsValue, columns);

    //把原始的字段都带回去，因为后端不会再取了：不能全部带过去，否则有些被删除了的字段又加回来了，除了ID字段，其它的不带，由后端框架统一处理
    const data = {...fieldsValue};
    if (data.filterFieldMap) {
      delete data.filterFieldMap;
    }
    if (delete data.renderFieldMap) {
      delete data.renderFieldMap;
    }
    if (props && props.values && props.values.id) {
      data.id = props.values.id;
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
      width={840}
      bodyStyle={{
        padding: '32px 40px 48px',
      }}
      destroyOnClose
      title={title}
      visible={editModalVisible}
      footer={renderFooter()}
      onCancel={() => onCancel()}
      keyboard={false}
      closable={false} 
      maskClosable={false}
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

import { log } from '@/utils/utils';
import { Button, Form, Modal } from 'antd';
import React, { useState } from 'react';
import { convertValues, processValues, renderColumn } from './Helper';

const formLayout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 13,
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

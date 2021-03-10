import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import { ReloadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { message, Breadcrumb, Input, Form, Button, Radio, Card, Modal } from 'antd';
import request from '@/utils/request';

const { TextArea } = Input;

const SQL_TYPE = [
  {type: 'query', label: '查询语句'},
  {type: 'execute', label: 'Insert、Update或Delete语句'},
  {type: 'ddl', label: 'DDL语句'},
];

const Page = () => {
  const [ loading, setLoading ] = useState(false);
  const [ modalVisible, setModalVisible ] = React.useState(false);
  const [ password, setPassword ] = useState("");
  const [ value, setValue ] = useState("");
  const [ type, setType ] = useState(SQL_TYPE[0].type);
  const [ result, setResult ] = useState();

  const clear = () => {
    setResult(null);
    setValue("");
    setType(SQL_TYPE[0].type);
  };

  const hideModal = () => {
    setModalVisible(false);
    setPassword("");
  };

  const validateAndShowModal = () => {
    if (!type || type.length == 0) {
      message.error('请选择类型');
      return;
    }
    if (!value || type.length == 0) {
      message.error('请输入SQL');
      return;
    }
    if (SQL_TYPE[0].type == type) {
      if (!value.trim().startsWith('select') && !value.trim().startsWith('SELECT')) {
        message.error('查询SQL需要以select开头');
        return;
      }
      if (value.indexOf(';') >= 0) {
        message.error('查询SQL不能为多条，也不能以分号结尾');
        return;
      }
    } else if (SQL_TYPE[1].type == type) {
      const arr = ["insert", "update", "delete", "INSERT", "UPDATE", "DELETE"];
      const sqlList = value.split(';');
      for (let m=0; m<sqlList.length; m++) {
        const sql = sqlList[m];
        let valid = false;
        for (let i=0; i<arr.length; i++) {
          if (sql.trim().startsWith(arr[i])) {
            valid = true;
            break;
          }
        }
        if (!valid) {
          message.error('Insert、Update、Delete语句需要以insert、update或delete开头');
          return;
        }
      }
    }
    setModalVisible(true);
  };
  
  const executeSql =  async () => {
    setLoading(true);
    setResult(null);
    const hide = message.loading('执行中...');
    const r = await request(ctx + 'ajax/base/sql/execute', {
      method: 'POST',
      data: {
        type,
        sql: value,
        password,
      }
    });
    hide();
    setLoading(false);
    if (r) {
      setResult(r);
      hideModal();
      message.success('执行成功');
    }
  };

  return (
    <PageContainer>
      <Form layout="vertical" style={{backgroundColor: '#ffffff', padding: '20px'}}>
        <Form.Item label="请选择SQL类型">
          <Radio.Group onChange={e => setType(e.target.value)} value={type}>
            {SQL_TYPE.map(t => <Radio key={t.type} value={t.type}>{t.label}</Radio>)}
          </Radio.Group>
        </Form.Item>
        <Form.Item label="请输入SQL语句(查询SQL每次只能执行一条，其他SQL每次可执行多条，用;分隔)">
          <TextArea rows={4} allowClear value={value} onChange={e => setValue(e.target.value)} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={() => validateAndShowModal()}>执行</Button>
          &nbsp;&nbsp;
          <Button type="normal" onClick={() => clear()}>清空</Button>
        </Form.Item>
        <Form.Item>
          <Card title="执行结果">
            {result ? JSON.stringify(result) : ''}
          </Card>
        </Form.Item>
      </Form>

      <Modal
        title="输入密码"
        visible={modalVisible}
        onOk={executeSql}
        confirmLoading={loading}
        onCancel={() => hideModal()}
      >
        <Form layout="vertical">
          <Form.Item label="请输入密码">
              <Input value={password} onChange={e => setPassword(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Page;

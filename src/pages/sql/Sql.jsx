import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import { ReloadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { message, Breadcrumb, Input, Form, Button, Radio, Card } from 'antd';
import request from '@/utils/request';

const { TextArea } = Input;

const SQL_TYPE = [
  {type: 'query', label: '查询语句'},
  {type: 'execute', label: 'Insert、Update或Delete语句'},
  {type: 'ddl', label: 'DDL语句'},
];

const Page = () => {
  const [ loading, setLoading ] = useState(false);
  const [ value, setValue ] = useState("");
  const [ type, setType ] = useState(SQL_TYPE[0].type);
  const [ result, setResult ] = useState();
  
  const executeSql =  async () => {
    if (!type || type.length == 0) {
      message.error('请选择类型');
      return;
    }
    if (!value || type.length == 0) {
      message.error('请输入SQL');
      return;
    }

    setLoading(true);
    const hide = message.loading('执行中...');
    const r = await request(ctx + 'ajax/base/sql/execute', {
      method: 'POST',
      data: {
        type,
        sql: value,
      }
    });
    hide();
    setLoading(false);
    if (r) {
      setResult(r);
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
          <Button type="primary" loading={loading} onClick={() => executeSql()}>执行</Button>
        </Form.Item>
        <Form.Item>
          <Card title="执行结果">
            {result ? JSON.stringify(result) : '无结果'}
          </Card>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

export default Page;

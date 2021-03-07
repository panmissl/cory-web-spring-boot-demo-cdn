import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import { Form, Rate, Tag } from 'antd';
import React from 'react';
import { log } from '@/utils/utils';
const FormItem = Form.Item;

const Page = () => {

  const listRenderer = {
    name: (value, record, index) => {
      log('list renderer', value, record, index);
      return (
        <Tag color="success">{value} -- 年龄：{record.age}</Tag>
      );
    },
  };

  const editRenderer = {
    name: column => (
      <FormItem key={column.dataIndex} name={column.dataIndex} label={column.title} tooltip={column.tooltip}>
        <Rate />
      </FormItem>
    ),
  };

  return (
    <PageContainer>
      <TableList model="com.cory.model.Demo" ellipsisFields={['remark']} showId={true} editRenderer={editRenderer} listRenderer={listRenderer} />
    </PageContainer>
  );
};

export default Page;

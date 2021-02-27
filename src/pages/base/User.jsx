import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';

const User = () => {
  return (
    <PageContainer>
      <TableList model="com.cory.model.User" module="base" />
    </PageContainer>
  );
};

export default User;

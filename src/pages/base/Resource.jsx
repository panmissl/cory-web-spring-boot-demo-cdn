import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';

const User = () => {
  return (
    <PageContainer>
      <TableList model="com.cory.model.Resource" params={{sort: 'VALUE DESC'}} pageSize={200} />
    </PageContainer>
  );
};

export default User;

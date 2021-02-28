import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';

const User = () => {
  return (
    <PageContainer>
      <TableList model="com.cory.model.SystemConfig" ellipsisFieldList={['val']} showId={true} />
    </PageContainer>
  );
};

export default User;

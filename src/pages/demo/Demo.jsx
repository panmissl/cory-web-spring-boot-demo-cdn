import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';

const Page = () => {
  return (
    <PageContainer>
      <TableList model="com.cory.model.Demo" ellipsisFields={['remark']} showId={true} />
    </PageContainer>
  );
};

export default Page;

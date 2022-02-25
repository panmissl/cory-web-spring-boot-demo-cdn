import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';

const Page = () => {
  return (
    <PageContainer>
      <TableList model="com.cory.model.AccessCount" showId={true} params={{sort: 'ACCESS_COUNT DESC'}} />
    </PageContainer>
  );
};

export default Page;

import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React from 'react';
import { Tooltip } from 'antd';

const Page = () => {
  return (
    <PageContainer>
      <TableList 
        model="com.cory.model.ExportJob" 
        showId={true} 
        listRenderer={{
          type: v => v ? (v.length > 10 ? <Tooltip title={v}>{v.substr(0, 8) + '...'}</Tooltip> : v) : '', 
          code: v => v ? (v.length > 10 ? <Tooltip title={v}>{v.substr(0, 8) + '...'}</Tooltip> : v) : '', 
          downloadUrl: v => v && v.length > 0 && v !== '-' ? <a href={v} target="_blank">下载</a> : '',
          errorMsg: v => v ? (v.length > 10 ? <Tooltip title={v}>{v.substr(0, 8) + '...'}</Tooltip> : v) : '', 
        }}
      />
    </PageContainer>
  );
};

export default Page;

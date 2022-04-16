import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React, { useState, useEffect } from 'react';
import { Alert } from 'antd';
import request from '@/utils/request';

const Page = () => {

  const [ ipAndPort, setIpAndPort ] = useState();

  const loadIpAndPort = async () => {
    setIpAndPort(await request(ctx + 'ajax/base/systemconfig/ip_port'));
  };

  useEffect(() => loadIpAndPort(), []);

  return (
    <PageContainer>
      <Alert style={{marginBottom: '10px'}} showIcon message={`当前机器IP及端口：${ipAndPort || '加载中...'}`} type="info" />
      <TableList model="com.cory.model.Cluster" showId={true} />
    </PageContainer>
  );
};

export default Page;

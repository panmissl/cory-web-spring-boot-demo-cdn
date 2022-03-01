import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import { ReloadOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { message, Alert } from 'antd';
import request from '@/utils/request';

const Page = () => {
  const [ loading, setLoading ] = useState(false);
  const [ ipAndPort, setIpAndPort ] = useState();
  
  const refreshCache =  async () => {
    setLoading(true);
    const hide = message.loading('刷新中...');
    const success = await request(ctx + 'ajax/base/systemconfig/refreshCache');
    hide();
    setLoading(false);
    if (success) {
      message.success('刷新成功');
    }
  };

  const loadIpAndPort = async () => {
    setIpAndPort(await request(ctx + 'ajax/base/systemconfig/ip_port'));
  };

  useEffect(() => loadIpAndPort(), []);

  return (
    <PageContainer>
      <Alert style={{marginBottom: '10px'}} showIcon message={`本机IP及端口：${ipAndPort || '加载中...'}`} type="info" />
      <TableList 
        model="com.cory.model.SystemConfig" 
        ellipsisFieldList={['val']} 
        showId={true} 
        toolbar={[{label: '刷新缓存', handler: refreshCache, type: 'primary', danger: true, icon: <ReloadOutlined />, loading: loading}]}/>
    </PageContainer>
  );
};

export default Page;

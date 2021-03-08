import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import { ReloadOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { message } from 'antd';
import request from '@/utils/request';

const Page = () => {
  const [ loading, setLoading ] = useState(false);
  
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

  return (
    <PageContainer>
      <TableList 
        model="com.cory.model.SystemConfig" 
        ellipsisFieldList={['val']} 
        showId={true} 
        toolbar={[{label: '刷新缓存', handler: refreshCache, type: 'primary', danger: true, icon: <ReloadOutlined />, loading: loading}]}/>
    </PageContainer>
  );
};

export default Page;

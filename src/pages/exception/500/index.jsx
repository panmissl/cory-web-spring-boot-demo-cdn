import { Link } from 'umi';
import { Result, Button } from 'antd';
import React from 'react';
export default () => (
  <Result
    status="500"
    title="500"
    style={{
      background: 'none',
    }}
    subTitle="服务器发生错误，请稍后再试或联系管理员处理."
    extra={
      <Link to="/">
        <Button type="primary">返回首页</Button>
      </Link>
    }
  />
);

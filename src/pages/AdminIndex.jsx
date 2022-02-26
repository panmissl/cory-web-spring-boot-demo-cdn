import { Avatar, Card, Col, Skeleton, Row, Statistic } from 'antd';
import React from 'react';
import { Link } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';

const PageHeaderContent = () => {
  const loading = window.USER;

  if (!loading) {
    return (
      <Skeleton
        avatar
        paragraph={{
          rows: 1,
        }}
        active
      />
    );
  }

  return (
    <div>
      <div>
        <Avatar size="large" src={window.USER.avatar} />
      </div>
      <div>
        <div>
          早安，
          {window.USER.nickName}
          ，祝你开心每一天！
        </div>
      </div>
    </div>
  );
};

function Index() {

  return (
    <PageContainer
      content={<PageHeaderContent />}
      header={{title: null, breadcrumb: null}}
    >
      <Row gutter={24}>
        <Col xl={16} lg={24} md={24} sm={24} xs={24}>
          <Card
            style={{
              marginBottom: 24,
            }}
            title="Box1"
            bordered={false}
            extra={<Link to="/">全部项目</Link>}
            bodyStyle={{
              padding: 0,
            }}
          >
            Box1
          </Card>
          <Card
            bodyStyle={{
              padding: 0,
            }}
            bordered={false}
            title="Box2"
          >
            Box2
          </Card>
        </Col>
        <Col xl={8} lg={24} md={24} sm={24} xs={24}>
          <Card
            style={{
              marginBottom: 24,
            }}
            title="快速开始 / 便捷导航"
            bordered={false}
            bodyStyle={{
              padding: 0,
            }}
          >
            Box3
          </Card>
          <Card
            style={{
              marginBottom: 24,
            }}
            bordered={false}
            title="XX 指数"
            loading={false}
          >
            XX 指数
          </Card>
          <Card
            bodyStyle={{
              paddingTop: 12,
              paddingBottom: 12,
            }}
            bordered={false}
            title="团队"
          >
            Box4
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

export default Index;

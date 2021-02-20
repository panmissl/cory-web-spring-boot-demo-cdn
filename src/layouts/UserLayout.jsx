import { getMenuData, getPageTitle } from '@ant-design/pro-layout';
import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { connect } from 'umi';
import Footer from '@/components/Footer';
import { initMeta } from '@/utils/utils';
import styles from './UserLayout.less';

const UserLayout = (props) => {
  initMeta();

  const {
    route = {
      routes: [],
    },
  } = props;
  const { routes = [] } = route;
  const {
    children,
    location = {
      pathname: '',
    },
  } = props;
  const { breadcrumb } = getMenuData(routes);
  const title = getPageTitle({
    pathname: location.pathname,
    formatMessage: null,
    breadcrumb,
    ...props,
  });
  return (
    <HelmetProvider>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={title} />
      </Helmet>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <span className={styles.title}>请登录</span>
            </div>
            <div className={styles.desc}>Hi, 欢迎光临!</div>
          </div>
          {children}
        </div>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default connect(({ settings }) => ({ ...settings }))(UserLayout);

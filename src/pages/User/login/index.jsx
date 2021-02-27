import { LockTwoTone, UserOutlined } from '@ant-design/icons';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
import React, { useEffect } from 'react';
import { connect } from 'umi';
import { getPageQuery } from '@/utils/utils';
import styles from './index.less';

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const redirect = () => {
  const urlParams = new URL(window.location.href);
  const params = getPageQuery();
  let { redirect } = params;

  if (redirect) {
    const redirectUrlParams = new URL(redirect);

    if (redirectUrlParams.origin === urlParams.origin) {
      redirect = redirect.substr(urlParams.origin.length);

      if (redirect.match(/^\/.*#/)) {
        redirect = redirect.substr(redirect.indexOf('#') + 1);
      }
    } else {
      window.location.href = '/';
      return;
    }
  }

  window.location.href = '/';
};

const loginSuccess = (showTip) => {
  if (showTip) {
    message.success('🎉 🎉 🎉  登录成功！', 1).then(() => redirect());
  } else {
    redirect();
  }
};

const Login = (props) => {
  const { loginInfo = { }, submitting } = props;
  const { loginError, loginMode = false } = loginInfo;

  console.log('loginInfo', loginInfo);

  if (window.USER) {
    loginSuccess(loginMode);
    return null;
  }

  const handleSubmit = (values) => {
    const { dispatch } = props;
    dispatch({
      type: 'user/login',
      payload: { ...values },
    });
  };

  return (
    <div className={styles.main}>
      <ProForm
        initialValues={{
          autoLogin: true,
        }}
        submitter={{
          render: (_, dom) => dom.pop(),
          submitButtonProps: {
            loading: submitting,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        onFinish={(values) => {
          handleSubmit(values);
          return Promise.resolve();
        }}
      >
        {loginError && (
          <LoginMessage
            content={'登录失败，账户或密码错误，请重新输入'}
          />
        )}
        {/*loginError && !submitting && (
          <LoginMessage content="验证码错误" />
        )*/}
        <ProFormText
          name="logonId"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined className={styles.prefixIcon} />,
          }}
          placeholder={'用户名'}
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockTwoTone className={styles.prefixIcon} />,
          }}
          placeholder={'密码'}
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        />

        {/*
        <div
          style={{
            marginBottom: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
        */}
      </ProForm>
    </div>
  );
};

export default connect(({ user, loading }) => ({
  loginInfo: user,
  submitting: loading.effects['user/login'],
}))(Login);

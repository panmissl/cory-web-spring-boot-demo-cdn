import { LockTwoTone, UserOutlined } from '@ant-design/icons';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
import React, { useEffect } from 'react';
import { connect } from 'umi';
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

const urlParams = () => {
  let search = window.location.search || '';
  if (search == '') {
    return null;
  }
  const question = search.substr(0, 1);
  if (question == '?') {
    search = search.substr(1);
  }
  const arr = search.split('&');
  const params = {};
  arr.forEach(item => {
    const kv = item.split('=');
    params[kv[0]] = decodeURIComponent(kv[1]);
  });
  return params;
};

const redirect = () => {
  const params = urlParams();
  if (!params || !params['returnUrl']) {
    window.location.href = '/';
    return;
  }
  let returnUrl = params['returnUrl'];
  if (returnUrl.substr(0, 1) != '/') {
    returnUrl = '/' + returnUrl;
  }
  window.location.href = returnUrl;
};

const loginSuccess = (loginMode) => {
  /*
  if (loginMode) {
    message.success('🎉 🎉 🎉  登录成功！', 1).then(() => redirect());
  } else {
    redirect();
  }
  */
  message.success(`🎉 🎉 🎉  ${loginMode ? '登录成功' : '已经登录，正在跳转...'}！`, 1).then(() => redirect());
};

const Login = (props) => {
  const { loginInfo = { }, submitting } = props;
  const { loginError, loginMode = false } = loginInfo;

  useEffect(() => {
    console.log('loginInfo', loginInfo);
  
    if (window.USER) {
      loginSuccess(loginMode);
    }
  }, [loginMode]);

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

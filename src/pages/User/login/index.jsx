import { LockTwoTone, UserOutlined } from '@ant-design/icons';
import ProForm, { ProFormText } from '@ant-design/pro-form';
import { Alert, message } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'umi';
import styles from './index.less';
import Keyevent from 'react-keyevent';
import Captcha from '@/components/Captcha';
import { log } from '@/utils/utils';

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
  arr.forEach((item) => {
    const kv = item.split('=');
    params[kv[0]] = decodeURIComponent(kv[1]);
  });
  return params;
};

const TYPE_SIMPLE = 'SIMPLE:';
const TYPE_ROLE = 'ROLE:';

const redirect = () => {
  const params = urlParams();
  if (params && params['returnUrl']) {
    let returnUrl = params['returnUrl'];
    if (returnUrl.substr(0, 1) != '/') {
      returnUrl = '/' + returnUrl;
    }
    window.location.href = returnUrl;
    return;
  }
  if (!window.successUrl || !window.USER || !window.USER.role) {
    window.location.href = '/';
    return;
  }
  let url = window.successUrl;
  //SIMPLE:/, SIMPLE:/admin, ROLE:roleName1=/admin,roleName2=/test,roleName3=/haha,/defaultPage
  if (url.startsWith(TYPE_SIMPLE)) {
    url = url.substr(TYPE_SIMPLE.length);
  } else if (url.startsWith(TYPE_ROLE)) {
    url = url.substr(TYPE_ROLE.length);
    const arr = url.split(',');
    const map = {};
    let defaultUrl = '/';
    for (let i=0; i<arr.length; i++) {
      if (arr[i].indexOf('=') >= 0) {
        const itemArr = arr[i].split('=');
        map[itemArr[0].trim()] = itemArr[1].trim();
      } else {
        defaultUrl = arr[i].trim();
      }
    }
    url = map[window.USER.role] || defaultUrl;
  }
  window.location.href = url;
};

const loginSuccess = (loginMode) => {
  /*
  if (loginMode) {
    message.success('🎉 🎉 🎉  登录成功！', 1).then(() => redirect());
  } else {
    redirect();
  }
  */
  message
    .success(`🎉 🎉 🎉  ${loginMode ? '登录成功' : '已经登录，正在跳转...'}！`, 1)
    .then(() => redirect());
};

const Login = (props) => {
  const { loginInfo = {}, submitting } = props;
  const { loginError, loginMode = false } = loginInfo;

  const [captchaRefresh, setCaptchaRefresh] = useState(1);
  const [captcha, setCaptcha] = useState();

  const formRef = useRef();

  useEffect(() => {
    log('loginInfo', loginInfo);

    if (window.USER) {
      loginSuccess(loginMode);
    }
  }, [loginMode]);

  useEffect(() => {
    log('loginError changed', loginError);
    if (loginError) {
      setCaptchaRefresh(captchaRefresh + 1);
    }
  }, [loginError]);

  const handleSubmit = (values) => {
    if (!captcha || captcha == '') {
      message.error('请输入验证码');
      return;
    }
    const { dispatch } = props;
    dispatch({
      type: 'user/login',
      payload: { ...values, captcha },
    });
  };

  return (
    <Keyevent
      events={{
        onEnter: (e) => {
          // console.log('enter key event', e, formRef)
          formRef.current.submit();
        },
      }}
      needFocusing={false}
    >
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
          formRef={formRef}
        >
          {loginError && <LoginMessage content={'登录失败，账户或密码错误，请重新输入'} />}
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
          <Captcha onChange={(v) => setCaptcha(v)} refresh={captchaRefresh} />
        </ProForm>
      </div>
    </Keyevent>
  );
};

export default connect(({ user, loading }) => ({
  loginInfo: user,
  submitting: loading.effects['user/login'],
}))(Login);

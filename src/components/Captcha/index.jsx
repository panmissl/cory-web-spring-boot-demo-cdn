import { Input } from 'antd';
import { useEffect, useState } from 'react';

/**
 * 验证码组件
 * 用法：<Captcha onChange={v => setCaptchaText(v)} refresh={1} />
 * @param {*} props 
 *     onChange：输入验证码后的回调，输入完成后提交。提交的参数名叫：captcha。
 *     refresh：是一个数字，如果改变，那么会刷新验证码，实现不用点击图片，从外面刷新的功能
 */
const Captcha = props => {

  const { onChange, refresh } = props;

  const [ version, setVersion ] = useState();
  const [ captcha, setCapthca ] = useState();

  useEffect(() => updateVersion(), []);
  useEffect(() => updateVersion(), [refresh]);
  
  const updateVersion = () => setVersion(new Date().getTime());

  const captchaChange = v => {
    setCapthca(v);
    onChange(v);
  };

  return (
    <span style={{display: 'flex', flexDirection: 'row', alignItems: 'center', height: '40px', lineHeight: '40px'}}>
      <span>验证码：</span>
      <Input value={captcha} onChange={e => captchaChange(e.target.value)} style={{width: '80px'}} />
      <img src={`/captcha.svl?v=${version}`} onClick={updateVersion} style={{marginLeft: '10px'}} />
    </span>
  );
};

export default Captcha;

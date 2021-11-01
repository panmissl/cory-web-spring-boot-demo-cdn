import { Input } from 'antd';
import { useEffect, useState } from 'react';

/**
 * 验证码组件
 * 用法：<Captcha onChange={v => setCaptchaText(v)} />
 * @param {*} props 有一个属性：onChange是输入验证码后的回调，输入完成后提交。提交的参数名叫：captcha
 */
const Captcha = props => {

  const { onChange } = props;

  const [ version, setVersion ] = useState();
  const [ captcha, setCapthca ] = useState();

  useEffect(() => updateVersion(), []);
  
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

import { useEffect, useState } from 'react';
import './index.less';

/**
 * 验证码组件
 * 用法：<Captcha onChange={v => setCaptchaText(v)} refresh={1} />
 * css样式：可以用自定义样式覆盖默认样式
 * @param {*} props 
 *     onChange：输入验证码后的回调，输入完成后提交。提交的参数名叫：captcha。
 *     refresh：是一个数字，如果改变，那么会刷新验证码，实现不用点击图片，从外面刷新的功能
 */
const Captcha = props => {

  const { onChange, refresh } = props;

  const [ version, setVersion ] = useState();
  const [ captcha, setCapthca ] = useState('');

  useEffect(() => updateVersion(), [refresh]);
  
  const updateVersion = () => setVersion(new Date().getTime());

  const captchaChange = v => {
    setCapthca(v);
    onChange(v);
  };

  return (
    <span className='captcha-container'>
      <input placeholder="验证码" value={captcha || ''} onChange={e => captchaChange(e.target.value)} className='captcha-input' />
      <img src={`/captcha.svl?v=${version}`} onClick={updateVersion} className='captcha-image' />
    </span>
  );
};

export default Captcha;

import { DefaultFooter } from '@ant-design/pro-layout';

const Footer = () => {

  return (
    <DefaultFooter 
      copyright={`${new Date().getFullYear()} 谢谢访问`}
      links={null}
    />
  );
};

export default Footer;

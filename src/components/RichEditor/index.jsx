import { message, Upload } from 'antd';
import { PictureFilled } from '@ant-design/icons';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/index.css';
import { ContentUtils } from 'braft-utils';
import { useState } from 'react';

/**
 * 富文本编辑器，目前用的是：BRAFT EDITOR。文档：
 * https://gitcode.net/mirrors/margox/braft-editor
 * https://www.yuque.com/braft-editor/be/lzwpnr#zrs7hr
 * https://braft.margox.cn/demos/basic
 * 
 * 用法：<RichEditor placeholder={xxx} uploadHandler={xx} />，参考TableList的用法
 * uploadHandler是一个函数，定义为: (file, callback) = {}, file为上传的文件体，自己可以log出来看结果，参考OssUploader，callback是回调函数，上传成功后需要调用此回调函数，参数为文件的访问url
 * uploadHandler在使用TableList时直接传入即可。一般可以用OssUploader导出的uploadToOss方法即可
 * 
 * 注意：
 * 1、初始值不能直接用数据库存储的值，要用下面提供的方法：initRichEditorValue来初始化。
 * 2、提交时，要用toRAW()或toHTML()方法提取内容。比如：values.content.toRAW() // or values.content.toHTML()
 */
const RichEditor = props => {

  const newProps = { ...props };

  let className = 'cory-braft-editor';
  if (newProps.className) {
    className += ' ' + newProps.className;
    delete newProps.className;
  }

  const [ html, setHtml ] = useState(newProps.value);
  delete newProps.value;

  let superOnChange = false;
  if (newProps.onChange) {
    superOnChange = newProps.onChange;
    delete newProps.onChange;
  }

  const htmlChange = v => {
    setHtml(v);
    superOnChange && superOnChange(v);
  };

  //目前不用BraftEditor带的媒体上传，自己实现图片上传即可
  /**
   * params: {
   *   file: 文件体
   *   progress: (progress) => {} //progress: 1 - 100
   *   libraryId: String 
   *   success: (res) => {} //res须为一个包含已上传文件url属性的对象
   *   error: (err) => {}
   * }
   */
  /*
  const uploadHandler = (params) => {
    if (!props.uploadHandler) {
      message.error('还未设置上传回调函数，请先设置');
      return;
    }
    props.uploadHandler(params);
  };

  const media = {
    accepts: {
      image: 'image/png,image/jpeg,image/gif,image/webp,image/apng,image/svg',
      video: false, 
      audio: false
    },
    uploadFn: uploadHandler,
  };
  */

  /**
   * options: {
   *   file: 文件体
   *   progress: (progress) => {} //progress: 1 - 100
   *   libraryId: String 
   *   success: (res) => {} //res须为一个包含已上传文件url属性的对象
   *   error: (err) => {}
   * }
   * https://github.com/react-component/upload#customrequest
   * //https://www.cnblogs.com/qianguyihao/p/13093592.html
   */
  const uploadHandler = (options) => {
    if (!props.uploadHandler) {
      message.error('还未设置上传回调函数，请先设置');
      return;
    }
    const { onSuccess, onError, file, onProgress } = options;

    props.uploadHandler(file, url => setHtml(ContentUtils.insertMedias(html, [{
      type: 'IMAGE',
      url: url
    }])));
  }

  const controls = [
    //'undo', 'redo', 'separator',
    'font-size', 'line-height', 'letter-spacing', 'separator',
    'text-color', 'bold', 'italic', 'underline', 'strike-through', 'hr', 'separator',
    //'superscript', 'subscript', 'remove-styles', 'emoji',  'separator', 
    'text-indent', 'text-align', 'separator',
    //'headings', 'list-ul', 'list-ol', 'blockquote', 'code', 'separator',
    'headings', 'list-ul', 'list-ol', 'blockquote', 'link', 'separator',
    //'media', 'separator',
    //'clear'
  ];
  const extendControls = [{
    key: 'antd-uploader',
    type: 'component',
    component: (
      <Upload
        accept="image/*"
        showUploadList={false}
        customRequest={uploadHandler}
      >
        {/*<Button type='default' icon={<PictureFilled />}>插入图片</Button>*/}
        {/* 这里的按钮最好加上type="button"，以避免在表单容器中触发表单提交，用Antd的Button组件则无需如此 */}
        <button type="button" className="control-item button upload-button" data-title="插入图片">
          <PictureFilled style={{fontSize: '16px'}} />
        </button>
      </Upload>
    )
  }];

  /*
  return (
    <BraftEditor {...newProps} className={className} media={media} controls extendControls />
  );
  */
  return <BraftEditor {...newProps} className={className} controls={controls} extendControls={extendControls} value={html} onChange={htmlChange} />;
};

export default RichEditor;

//初始化富文本编辑器的值，因为不能将原始的html输入，有些编辑器是需要自己初始化的
export const initRichEditorValue = value => BraftEditor.createEditorState(value || "");
import { message, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import request from '@/utils/request';
import {log} from '@/utils/utils';

const parseFileExt = file => {
  const { name } = file;
  const extIndex = name.lastIndexOf('.');
  if (extIndex >= 0 && name.length > (extIndex + 1)) {
    return name.substr(extIndex + 1);
  }
  return "file";
};

const buildFileUrl = (host, path) => {
  if (host.endsWith('/')) {
    host = host.substr(0, host.length - 1);
  }
  if (path.startsWith('/')) {
    path = path.substr(1);
  }
  return host + '/' + path;
};

/**
 * 上传文件到OSS
 * @param {*} ossType ossType: CONTRAST_UPLOAD_IMAGE / MONEY_IMAGE / ...
 * @param {*} file 
 * @param {*} callback (success, url) => {}, success: true/false，文件是否上传成功。url：上传成功时返回文件的访问路径，失败时没有
 */
const uploadToOss = async (ossType, file, callback) => {
  const policyInfo = await request(ctx + 'ajax/oss/generateUploadPolicy', {
    data: {type: ossType, fileExt: parseFileExt(file) },
  });

  log('upload policy info', policyInfo);

  /*
  {
    ak: "abc"
    expire: "1645278164"
    filePath: "2022-02-19/logo_rc-upload-1645277975221-4_1645277984157.png"
    host: "http://xxxxxx"
    policy: "eyJleHBpcmF0aW9uIjoiMjAyMi0wMi0xOVQxMzo0Mjo0NC41NDJaIiwiY29uZGl0aW9ucyI6W1siY29udGVudC1sZW5ndGgtcmFuZ2UiLDAsMjA5NzE1MjBdXX0="
    signature: "N9/O+LK/KpWCe9u6yb4UbWWQ2UM="
  }
  */

  //用request 会有各种怪问题，直接使用原生fetch请求

  const data = new FormData();
  data.append("key", policyInfo.filePath);
  data.append("OSSAccessKeyId", policyInfo.ak);
  data.append("policy", policyInfo.policy);
  data.append("Signature", policyInfo.signature);
  data.append("file", file);
  //防止204错误
  data.append("success_action_status", '200');
  fetch(policyInfo.host, {
    method: 'POST',
    body: data,
    //不能放header，FormData自己会处理成：multipart/form-data xxxboundary的结果，放了就会出错
    // headers: {
    //     "Content-Type": "multipart/form-data"
    // },
  }).then(response => {
    log('upload finish, response', response);

    if (response.status === 200) {
      callback && callback(true, buildFileUrl(policyInfo.host, policyInfo.filePath));
    } else {
      message.error('文件上传失败，请重试!');
      callback && callback(false);
    }
  })
  .catch(error => {
    log('upload fail', error);
    message.error('文件上传失败，请重试!');
    callback && callback(false);
  });
};

/**
 * 上传文件到OSS，然后回调
 * https://ant.design/components/upload-cn/#API
 * 
 * props: {
 *   ossType: CONTRAST_UPLOAD_IMAGE / MONEY_IMAGE / ...
 *   accept: 默认是：image/*
 *   success: 成功的回调，参数是上传成功的文件url
 * }
 * 
 * 举例：
 * <OssUploader ossType="MONEY_IMAGE" success={url => log('oss upload success, url: ' + url)} />;
 */
const OssUploader = props => {

  const { accept, success, ossType } = props;

  const [loading, setLoading] = useState(false);

  const doUpload = async (options) => {
    log('do upload', options);
    const { onSuccess, onError, file, onProgress } = options;

    setLoading(true);

    uploadToOss(ossType, file, (s, url) => {
      setLoading(false);
      s && success && success(url);
    });
  };

  return (
    <Upload
      accept={accept || 'image/*'}
      customRequest={doUpload}
      showUploadList={false}
    >
      <Button icon={<UploadOutlined />} loading={loading}>点击上传</Button>
    </Upload>
  );
};

export default OssUploader;
export { uploadToOss };
import { useEffect, useState, Fragment } from 'react';
import { Image, Button, Popconfirm, Input, Tooltip } from 'antd';
import OssUploader from '@/components/OssUploader';
import { log } from '@/utils/utils';
import {
  DeleteOutlined,
} from '@ant-design/icons';

/**
 * 单个图片上传编辑器，比如logo图等。会展示上传按钮，上传后显示图片。
 * 上传会传到OSS，使用OssUploader来上传
 * 支持使用网络图片
 * 
 * 用法：<SingleImageUploadInput ossType='xxx' />
 * 
 * props: {
 *   ossType: 必选。CONTRAST_UPLOAD_IMAGE / MONEY_IMAGE / ...
 *   width: 可选，图片宽度
 * }
 */
const SingleImageUploadInput = props => {

  log('single image upload input, props: ', props);

  if (!props) {
    return null;
  }

  const { ossType, value, onChange, width = 50 } = props;

  if (!ossType) {
    throw new Error('ossType不能为空!');
  }

  const [ imageUrl, setImageUrl ] = useState(value);

  useEffect(() => {
    onChange(imageUrl);
  }, [ imageUrl ]);

  const renderImage = () => {
    if (!imageUrl) {
      return null;
    }
    return <Image width={width} src={imageUrl} />;
  };

  return (
    <Fragment>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
        <OssUploader ossType={ossType} success={url => setImageUrl(url)} />
        <Input style={{marginLeft: '4px'}} value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="指定网络图片" />
        {imageUrl && (
          <Popconfirm
            title="确认删除?"
            onConfirm={() => setImageUrl(null)}
            okText="删除"
          >
            <Tooltip title='删除'><Button style={{marginLeft: '4px', padding: '0 4px'}} danger icon={<DeleteOutlined />}></Button></Tooltip>
          </Popconfirm>
        )}
        <div style={{marginLeft: '4px'}}>
          {renderImage()}
        </div>
      </div>

    </Fragment>
  );
};

export default SingleImageUploadInput;
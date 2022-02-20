import { useEffect, useState, Fragment } from 'react';
import { Image, Button, Popconfirm } from 'antd';
import OssUploader from '@/components/OssUploader';
import { log } from '@/utils/utils';
import {
  DeleteOutlined,
} from '@ant-design/icons';

/**
 * 单个图片上传编辑器，比如logo图等。会展示上传按钮，上传后显示图片。
 * 上传会传到OSS，使用OssUploader来上传
 * 
 * 用法：<SingleImageUploadInput ossType='xxx' fieldMeta={field} />
 * 
 * props: {
 *   ossType: 必选。CONTRAST_UPLOAD_IMAGE / MONEY_IMAGE / ...
 *   fieldMeta: 必选。后台返回的列定义，自定义渲染时传进来
 *   width: 可选，图片宽度
 * }
 */
const SingleImageUploadInput = props => {

  log('single image upload input, props: ', props);

  if (!props) {
    return null;
  }

  const { ossType, value, onChange, fieldMeta, width = 100 } = props;

  if (!ossType) {
    throw new Error('ossType不能为空!');
  }
  if (!fieldMeta) {
    throw new Error('fieldMeta不能为空!');
  }

  const [ imageUrl, setImageUrl ] = useState(value);

  useEffect(() => {
    onChange(imageUrl);
  }, [ imageUrl ]);

  const renderImage = () => {
    if (!imageUrl) {
      return <Fragment>请上传图片</Fragment>;
    }
    return <Image width={width} src={imageUrl} />;
  };

  return (
    <Fragment>
      <OssUploader ossType={ossType} success={url => setImageUrl(url)} />

      {imageUrl && (
        <Popconfirm
          title="确认删除?"
          onConfirm={() => setImageUrl(null)}
          okText="删除"
        >
          <Button className='margin-left-8' danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      )}
      <div>
        {renderImage()}
      </div>
    </Fragment>
  );
};

export default SingleImageUploadInput;
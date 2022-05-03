import { Select } from 'antd';
import { useEffect, useState, Fragment } from 'react';
import request from '@/utils/request';
import {log} from '@/utils/utils';
import { COLUMN_TYPE } from '@/components/TableList/Helper';
const { Option } = Select;

/**
 * 数据字典编辑器
 * 
 * 用法：<DatadictEditor fieldMeta={column} />
 * fieldMeta的值用utils里的getDatadictFieldMeta
 */
const DatadictEditor = props => {

  log('data dict editor, props: ', props);

  if (!props) {
    return null;
  }

  const { value, onChange, fieldMeta } = props;

  const [ val, setVal ] = useState((value === undefined || value === null) ? null : (value + ""));

  useEffect(() => {
    let realVal = val;
    if (val !== undefined && val !== null) {
      if (fieldMeta.fieldType == COLUMN_TYPE.INT || fieldMeta.fieldType == COLUMN_TYPE.BIGINT) {
        realVal = parseInt(val);
      }
      if (fieldMeta.fieldType == COLUMN_TYPE.DOUBLE) {
        realVal = parseFloat(val);
      }
    }
    onChange(realVal);
  }, [ val ]);

  return (
    <Select value={val} onChange={v => setVal(v)}>
      {(fieldMeta.dataDictList || []).map(item => <Option key={item.value} value={item.value}>{item.description}</Option>)}
    </Select>
  );
};

export default DatadictEditor;
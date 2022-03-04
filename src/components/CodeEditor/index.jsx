import { Select } from 'antd';
import { useState } from 'react';
import {Controlled as CodeMirror} from 'react-codemirror2'
import { log } from '@/utils/utils';
import { useEffect } from 'react';
import { Fragment } from 'react';
import './index.less';

const { Option } = Select;

require('codemirror/lib/codemirror.css');
require('codemirror/theme/material.css');
//java
require('codemirror/mode/clike/clike.js');
require('codemirror/mode/htmlmixed/htmlmixed.js');
require('codemirror/mode/javascript/javascript.js');
require('codemirror/mode/css/css.js');
require('codemirror/mode/xml/xml.js');
require('codemirror/mode/sql/sql.js');
require('codemirror/mode/python/python.js');
require('codemirror/mode/go/go.js');
require('codemirror/mode/groovy/groovy.js');
require('codemirror/mode/yaml/yaml.js');
require('codemirror/mode/markdown/markdown.js');

const MODE = {
  Java: 'text/x-java',
  HTML: 'htmlmixed',
  javascript: 'javascript',
  CSS: 'css',
  XML: 'xml',
  SQL: 'sql',
  Python: 'python',
  Go: 'go',
  Groovy: 'groovy',
  YAML: 'yaml',
  Markdown: 'markdown',
  C: 'text/x-csrc',
  'C++': 'text/x-c++src',
  'C#': 'text/x-csharp',
  'Objective-C': 'text/x-objectivec',
  Scala: 'text/x-scala',
  '文本': 'null',
};

const LANG = Object.keys(MODE);

const buildOptions = (lang, readOnly) => ({
  mode: MODE[lang],
  theme: 'material',
  lineNumbers: true,
  matchBrackets: true,
  readOnly: readOnly,
});

const SEPARATOR = ';';

const buildValue = (lang, code) => lang + SEPARATOR + code;

//return: [lang, code]
const parseLangAndCode = value => {
  const index = value.indexOf(SEPARATOR);
  const arr = [];
  arr[0] = value.substr(0, index);
  arr[1] = '';
  if (value.length > index + 1) {
    arr[1] = value.substr(index + 1);
  }
  return arr;
};

const EDITOR_MODE = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
};

/**
 * 一般情况下不用直接使用此组件，已经集成在TableList里了，在后台的Model里的Field里设置code=true即可。
 * 代码编辑器，目前用的是：https://github.com/scniro/react-codemirror2
 * 
 * 用法：<CodeEditor value={} onChange={value => Fn} mode="EDIT/VIEW" />，参考TableList的用法，集成在form里时一般不用value和onchange，只需要传入是编辑还是查看模式即可
 * 在查看时这样用：<CodeEditor value={} mode="VIEW" />
 */
const CodeEditor = props => {
  
  if (!props) {
    return null;
  }

  //mode: VIEW, EDIT
  const { value, onChange, mode = EDITOR_MODE.EDIT } = props;

  //value：用;分隔开，第一部分是语言，第二部分是内容

  const [ lang, setLang ] = useState(LANG[0]);
  const [ options, setOptions ] = useState(buildOptions(LANG[0], mode === EDITOR_MODE.VIEW));
  const [ code, setCode ] = useState();

  useEffect(() => setOptions(buildOptions(lang, mode === EDITOR_MODE.VIEW)), [lang]);

  useEffect(() => {
    log('value changed', value);
    if (value) {
      const arr = parseLangAndCode(value);
      log('parsed array', arr);
      setLang(arr[0]);
      setCode(arr[1]);
    } else {
      log('no value');
      setCode('');
    }
  }, [value]);

  const codeChange = v => {
    setCode(v);
    onChange(buildValue(lang, v));
  };
  
  const langChange = v => {
    setLang(v);
    onChange(buildValue(v, code));
  };

  return (
    <Fragment>
      {mode === EDITOR_MODE.EDIT && (
        <Select value={lang} onChange={langChange} style={{marginBottom: '8px'}}>
          {LANG.map(l => <Option value={l} key={l}>{l}</Option>)}
        </Select>
      )}
      <CodeMirror
        value={code}
        options={options}
        onBeforeChange={(editor, data, value) => {
          log('code editor before change', editor, data, value);
          codeChange(value);
        }}
        onChange={(editor, data, value) => {
          log('code editor change', editor, data, value);
        }}
      />
    </Fragment>
  );
};

export default CodeEditor;
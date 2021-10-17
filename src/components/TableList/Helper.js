import { log } from '@/utils/utils';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Input, InputNumber, notification, Popconfirm, Radio, Select } from 'antd';
import moment from 'moment';
import React from 'react';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

const COLUMN_TYPE = {
    INT: 'INT',
    BIGINT: 'BIGINT',
    DOUBLE: 'DOUBLE',
    VARCHAR: 'VARCHAR',
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATETIME: 'DATETIME',
    ENUM: 'ENUM',
    DATE: 'DATE',
};

/**
 * 根据字段类型返回字段提示：选择 / 输入
 * @param {*} type 字段类型，见：COLUMN_TYPE
 */
const requireTip = type => {
    if (type == COLUMN_TYPE.BOOLEAN || type == COLUMN_TYPE.ENUM || type == COLUMN_TYPE.DATETIME || type == COLUMN_TYPE.DATE) {
        return '选择';
    }
    return '输入';
};

/**
 * 利用enumMetaSet构造枚举选项：如果字段类型不是枚举则返回空
 * @param {*} fieldJavaType 字段Java类型，比如：java.lang.String, java.lang.Integer等
 */
const buildEnumOptions = (fieldJavaType, isValueEnum) => {
    const enumMetaSet = window.USER.enumMetaSet;
    if (!enumMetaSet || enumMetaSet.length == 0) {
        return null;
    }
    const enumMeta = enumMetaSet.find(e => e.className == fieldJavaType);
    if (!enumMeta) {
        return null;
    }
    const valueLabelOrderMap = enumMeta.valueLabelOrderMap;
    if (!valueLabelOrderMap) {
        return null;
    }
    let arr = Object.keys(valueLabelOrderMap).map(value => {
        const labelOrder = valueLabelOrderMap[value];
        const label = Object.keys(labelOrder)[0];
        const order = labelOrder[label];
        return {label, value, order};
    });
    arr = arr.sort((i1, i2) => i1.order - i2.order);
    log('arr', arr);

    if (isValueEnum) {
        const obj = {};
        arr.forEach(item => obj[item.value] = ({text: item.label, status: 'Default'}));
        return obj;
    }
    return arr.map(item => (<Option key={item.value} value={item.value}>{item.label}</Option>));
};

/**
 * 根据字段类型返回字段输入框。比如文本返回输入框，枚举返回下拉框
 * @param {*} column 字段定义：{ filedType, title, fieldLen, fieldJavaType }
 */
const renderColumnInput = column =>{
    if (column.fieldType == COLUMN_TYPE.INT || column.fieldType == COLUMN_TYPE.BIGINT || column.fieldType == COLUMN_TYPE.DOUBLE) {
        return (
            <InputNumber style={{width: '100%'}} placeholder={`请输入${column.title}`} />
        );
    }
    if (column.fieldType == COLUMN_TYPE.VARCHAR && column.fieldLen <= 500) {
        return (
            <Input placeholder={`请输入${column.title}`} />
        );
    }
    if (column.fieldType == COLUMN_TYPE.TEXT || (column.fieldType == COLUMN_TYPE.VARCHAR && column.fieldLen > 500)) {
        return (
            <TextArea rows={4} placeholder={`请输入${column.title}`} />
        );
    }
    if (column.fieldType == COLUMN_TYPE.BOOLEAN) {
        return (
        <RadioGroup>
            <Radio value="true">是</Radio>
            <Radio value="false">否</Radio>
        </RadioGroup>
        );
    }
    if (column.fieldType == COLUMN_TYPE.DATETIME) {
        return (
        <DatePicker
            style={{
            width: '100%',
            }}
            showTime={true}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择"
        />
        );
    }
    if (column.fieldType == COLUMN_TYPE.DATE) {
        return (
        <DatePicker
            style={{
            width: '100%',
            }}
            showTime={false}
            format="YYYY-MM-DD"
            placeholder="请选择"
        />
        );
    }
    if (column.fieldType == COLUMN_TYPE.ENUM) {
        return (
        <Select
            style={{
            width: '100%',
            }}
        >
            {buildEnumOptions(column.fieldJavaType)}
        </Select>
        );
    }
    notification.error({
        message: '错误',
        description: `不支持的类型：${column.fieldType}`,
    });
    return null;
};

/**
 * 渲染字段
 * @param {*} column 字段相关选项。来源于window.USER.modelMetaList
 */
const renderColumn = column => {
    /*
    fieldType: field.type, //INT,BIGINT,DOUBLE,VARCHAR,TEXT,BOOLEAN,DATETIME,ENUM,
    fieldJavaType: field.javaType,
    fieldNullable: field.nullable,
    fieldLen: field.len,

    title: field.label,
    tooltip: field.desc && field.desc.length > 0 ? field.desc : null,
    dataIndex: field.name,
    valueType: 'text',
    search: field.filtered,
    ellipsis: ellipsisFieldList.indexOf(field.name) >= 0,
    renderText: (val, record) => {
        return field.renderName && field.renderName.length > 0 ? (record && record.renderFieldMap ? record.renderFieldMap[field.renderName] : '') : val;
    },
    */

    if (column.customEditRenderer) {
        return column.customEditRenderer(column);
    }

    if (column.dataIndex == 'id') {
        return null;
    }

    //rule START
    const rules = [];
    if (false === column.fieldNullable) {
        rules.push({
        required: true,
        message: `请${requireTip(column.fieldType)}${column.title}！`,
        });
    }
    if (column.fieldType == COLUMN_TYPE.VARCHAR || column.fieldType == COLUMN_TYPE.TEXT && column.fieldLen > 0) {
        rules.push({
        max: column.fieldLen,
        message: `最大长度为${column.fieldLen}！`,
        });
    }
    if (column.fieldType == COLUMN_TYPE.INT || column.fieldType == COLUMN_TYPE.BIGINT) {
        rules.push({
        type: 'integer',
        message: `请输入数字！`,
        });
    }
    if (column.fieldType == COLUMN_TYPE.DOUBLE) {
        rules.push({
        type: 'number',
        message: `请输入数字！`,
        });
    }
    //rule END

    return (
        <FormItem key={column.dataIndex} name={column.dataIndex} label={column.title} rules={rules} tooltip={column.tooltip}>
        {renderColumnInput(column)}
        </FormItem>
    );
};

const parseValueType = (fieldType, fieldLen) => {
    //https://procomponents.ant.design/components/table/#valuetype-%E5%80%BC%E7%B1%BB%E5%9E%8B
    //Date,dateTime,dateRange,dateTimeRange,time,
    //text,select,textarea,digit
    if (fieldType == COLUMN_TYPE.INT || fieldType == COLUMN_TYPE.BIGINT || fieldType == COLUMN_TYPE.DOUBLE) {
        return 'digit';
    }
    if (fieldType == COLUMN_TYPE.VARCHAR && fieldLen <= 500) {
        return 'text';
    }
    if (fieldType == COLUMN_TYPE.TEXT || (fieldType == COLUMN_TYPE.VARCHAR && fieldLen > 500)) {
        return 'textarea';
    }
    if (fieldType == COLUMN_TYPE.BOOLEAN || fieldType == COLUMN_TYPE.ENUM) {
        return 'select';
    }
    if (fieldType == COLUMN_TYPE.DATETIME) {
        return 'dateTime';
    }
    if (fieldType == COLUMN_TYPE.DATE) {
        return 'date';
    }
    return 'text';
};

const parseValueEnum = field => {
    const valueType = parseValueType(field.type, field.len);
    if (valueType != 'select') {
        return null;
    }
    if (field.type == COLUMN_TYPE.BOOLEAN) {
        return {
            yes: {
                text: '是',
                status: 'Default',
            },
            no: {
                text: '否',
                status: 'Default',
            },
        };
    }
    if (field.type == COLUMN_TYPE.ENUM) {
        return buildEnumOptions(field.javaType, true);
    }
    return null;
};

/**
 * 
 * @param {*} param { model, ellipsisFieldList = [], operationList = [], showId = false }
 * @param {*} handleEditClick 点击编辑按钮时的处理器，参数：{visible: true, isCreate: false, record, }
 * @param {*} handleDelete 点击删除时的处理器，参数：{id, actionRef, pageInfo, }
 * @param {*} actionRef 
 * @param {*} detailHandler 详情点击时的处理器，参数为record，就是一条记录
 */
const parsePageInfo = ({ model, ellipsisFieldList = [], operationList = [], showId = false, listRenderer = {}, editRenderer = {} }, handleEditClick, handleDelete, actionRef, detailHandler) => {
    const { modelMetaList } = window.USER;
    const modelMeta = modelMetaList.find(meta => meta.className == model);
    const { name, module, createable, updateable, deleteable, fieldList } = modelMeta;

    const modelBigName = model.substr(model.lastIndexOf('.') + 1);
    //const modelSmallName = modelBigName.substr(0, 1).toLowerCase() + modelBigName.substr(1);
    //const baseUrl = '/ajax/' + module.toLowerCase() + '/' + modelSmallName;
    const baseUrl = '/ajax/' + module.toLowerCase() + '/' + modelBigName.toLowerCase();
    const listUrl = baseUrl + '/listData';
    const saveUrl = baseUrl + '/save';
    const deleteUrl = baseUrl + '/delete/';

    const c = (field) => ({
        fieldType: field.type,
        fieldJavaType: field.javaType,
        fieldNullable: field.nullable,
        fieldLen: field.len,
        customEditRenderer: editRenderer[field.name],
        customListRenderer: listRenderer[field.name],

        title: field.label,
        tooltip: field.desc && field.desc.length > 0 ? field.desc : null,
        dataIndex: field.name,
        valueType: parseValueType(field.type, field.len),
        valueEnum: parseValueEnum(field),
        hideInSearch: !field.filtered,
        ellipsis: ellipsisFieldList.indexOf(field.name) >= 0,
        renderText: (val, record) => {
            return field.renderName && field.renderName.length > 0 ? (record && record.renderFieldMap ? record.renderFieldMap[field.renderName] : '') : val;
        },
        render: listRenderer[field.name] ? listRenderer[field.name] : null,
    });

    const listColumns = fieldList.filter(f => f.showable).map(field => c(field));
    const editColumns = fieldList.filter(f => f.showable && f.editable).map(field => c(field));
    const detailColumns = fieldList.filter(f => f.showable).map(field => c(field));

    if (showId) {
        listColumns.splice(0, 0, c({
            label: 'ID',
            name: 'id',
            filtered: false,
        }));
    }

    //列表列的时间和日期列：做成期间选择器: {index: 1, column: c}
    const rangeColumns = [];
    listColumns.forEach((c, index) => {
        //如果不搜索，则不用处理
        if (c.hideInSearch) {
            return;
        }
        if (c.valueType == 'date' || c.valueType == 'dateTime') {
            c.hideInSearch = true;
            rangeColumns.push({
                index: index,
                column: {
                    ...c,
                    hideInTable: true,
                    hideInSearch: false,
                    dataIndex: c.dataIndex + 'Range',
                    valueType: c.valueType == 'date' ? 'dateRange' : 'dateTimeRange',
                    search: {
                        transform: value => {
                            return {
                                [c.dataIndex + 'Start']: value[0],
                                [c.dataIndex + 'End']: value[1],
                            };
                        },
                    },
                },
            });
        }
    });
    if (rangeColumns.length > 0) {
        rangeColumns.forEach(({ index, column}) => listColumns.splice(index, 0, column));
    }

    editColumns.splice(0, 0, c({
        label: 'ID',
        name: 'id',
        hideInForm: true,
    }));

    let opArr = [];
    if (operationList.length > 0) {
        opArr = opArr.concat(operationList);
    }
    if (updateable) {
        opArr.push({
            handler: record => handleEditClick({visible: true, isCreate: false, record, }),
            label: '编辑',
            icon: <EditOutlined />,
        });
    }
    if (deleteable) {
        opArr.push({
            type: 'primary',
            danger: true,
            handler: record => handleDelete(record.id, actionRef, pageInfo),
            label: '删除',
            confirm: true,
            confirmText: '确认删除?',
            icon: <DeleteOutlined />,
        });
    }
    if (opArr.length > 0) {
        listColumns.push({
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => {
                let opIndex = 1;
                return opArr.map(op => {
                    if (op.confirm) {
                        return (
                        <Popconfirm
                            key={opIndex ++}
                            title={op.confirmText}
                            onConfirm={() => op.handler(record, actionRef, pageInfo)}
                            //onCancel={cancel}
                            okText="确认"
                            cancelText="取消">
                            <Button
                                type={op.type || 'normal'} 
                                danger={op.danger || false} 
                                loading={op.loading || false} 
                                icon={op.icon}>
                                {op.label}
                            </Button>
                        </Popconfirm>
                        );
                    }
                    
                    return <Button 
                        key={opIndex ++} 
                        type={op.type || 'normal'} 
                        onClick={() => op.handler(record, actionRef, pageInfo)} 
                        danger={op.danger || false} 
                        loading={op.loading || false} 
                        icon={op.icon}>
                            {op.label}
                    </Button>
                });
            },
        });
    }

    const searchEnable = fieldList.filter(f => f.filtered).length > 0;

    detailColumns.push(c({
        label: '创建时间',
        name: 'createTime',
        filtered: false,
        renderName: 'createTimeText',
    }));
    detailColumns.push(c({
        label: '最后更新时间',
        name: 'modifyTime',
        filtered: false,
        renderName: 'modifyTimeText',
    }));

    const pageInfo = {
        name,
        listUrl,
        saveUrl,
        deleteUrl,
        listColumns,
        editColumns,
        detailColumns,
        filters: [],
        validation: [],
        searchEnable,
        createable, 
        updateable, 
        deleteable,
    };

    //详情链接
    pageInfo.listColumns[0].render = (dom, entity) => {
        return <a onClick={() => detailHandler(entity)}>{dom}</a>;
    };

    log('pageInfo', pageInfo);

    return pageInfo;
};

/**
 * 转换值，目前主要是将字符串类型转为时间类型。后续有其他需要再加
 * @param {*} values 列值
 * @param {*} columns 列定义
 */
const convertValues = (values, columns = []) => {
    if (!values) {
        return values;
    }

    const getType = name => {
        const c = columns.find(c => c.dataIndex == name);
        return c && c.fieldType ? c.fieldType : null;
    };

    const obj = {};
    Object.keys(values).forEach(key => {
        const type = getType(key);
        let value = values[key];
        if (value && type && (type == COLUMN_TYPE.DATETIME || type == COLUMN_TYPE.DATE)) {
            value = moment(value);
        } else if (type == COLUMN_TYPE.BOOLEAN) {
            value = value === true ? 'true' : 'false';
        }
        obj[key] = value;
    });

    log('values', values, 'columns', columns, 'obj', obj);

    return obj;
};

/**
 * 处理对象值，目前主要是将时间类型转为字符串类型。后续有其他需要再加
 * @param {*} obj 表单值
 * @param {*} columns 列定义
 */
const processValues = (obj, columns) => {
    if (!obj) {
        return obj;
    }

    const getType = name => {
        const c = columns.find(c => c.dataIndex == name);
        return c && c.fieldType ? c.fieldType : null;
    };

    Object.keys(obj).forEach(key => {
        const type = getType(key);
        let value = obj[key];
        if (value && value._isAMomentObject) {
            obj[key] = value.format('YYYY-MM-DD HH:mm:ss');
        }
        if (value && type && type == COLUMN_TYPE.BOOLEAN) {
            obj[key] = value === 'true' ? true : false;
        }

        //最后，移除undefined的属性
        if (obj[key] === undefined) {
            delete obj[key];
        }
    });
    return obj;
};

export { renderColumn, parsePageInfo, convertValues, processValues };


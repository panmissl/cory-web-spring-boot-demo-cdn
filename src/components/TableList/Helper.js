import { Button, DatePicker, Form, Input, Modal, notification, Radio, Select, Steps, InputNumber, Popconfirm } from 'antd';
import React, { useState } from 'react';
import { log } from '@/utils/utils';

const FormItem = Form.Item;
const { Step } = Steps;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

const COLUMN_STATUS = {
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
 * @param {*} type 字段类型，见：COLUMN_STATUS
 */
const requireTip = type => {
    if (type == COLUMN_STATUS.BOOLEAN || type == COLUMN_STATUS.ENUM || type == COLUMN_STATUS.DATETIME || type == COLUMN_STATUS.DATE) {
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
    if (column.fieldType == COLUMN_STATUS.INT || column.fieldType == COLUMN_STATUS.BIGINT || column.fieldType == COLUMN_STATUS.DOUBLE) {
        return (
            <InputNumber placeholder={`请输入${column.title}`} />
        );
    }
    if (column.fieldType == COLUMN_STATUS.VARCHAR && column.fieldLen <= 500) {
        return (
            <Input placeholder={`请输入${column.title}`} />
        );
    }
    if (column.fieldType == COLUMN_STATUS.TEXT || (column.fieldType == COLUMN_STATUS.VARCHAR && column.fieldLen > 500)) {
        return (
            <TextArea rows={4} placeholder={`请输入${column.title}`} />
        );
    }
    if (column.fieldType == COLUMN_STATUS.BOOLEAN) {
        return (
        <RadioGroup>
            <Radio value="yes">是</Radio>
            <Radio value="no">否</Radio>
        </RadioGroup>
        );
    }
    if (column.fieldType == COLUMN_STATUS.DATETIME) {
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
    if (column.fieldType == COLUMN_STATUS.DATE) {
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
    if (column.fieldType == COLUMN_STATUS.ENUM) {
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
    if (column.fieldType == COLUMN_STATUS.VARCHAR || column.fieldType == COLUMN_STATUS.TEXT && column.fieldLen > 0) {
        rules.push({
        max: column.fieldLen,
        message: `最大长度为${column.fieldLen}！`,
        });
    }
    if (column.fieldType == COLUMN_STATUS.INT || column.fieldType == COLUMN_STATUS.BIGINT) {
        rules.push({
        type: 'integer',
        message: `请输入数字！`,
        });
    }
    if (column.fieldType == COLUMN_STATUS.DOUBLE) {
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
    if (fieldType == COLUMN_STATUS.INT || fieldType == COLUMN_STATUS.BIGINT || fieldType == COLUMN_STATUS.DOUBLE) {
        return 'digit';
    }
    if (fieldType == COLUMN_STATUS.VARCHAR && fieldLen <= 500) {
        return 'text';
    }
    if (fieldType == COLUMN_STATUS.TEXT || (fieldType == COLUMN_STATUS.VARCHAR && fieldLen > 500)) {
        return 'textarea';
    }
    if (fieldType == COLUMN_STATUS.BOOLEAN || fieldType == COLUMN_STATUS.ENUM) {
        return 'select';
    }
    if (fieldType == COLUMN_STATUS.DATETIME) {
        return 'dateTime';
    }
    if (fieldType == COLUMN_STATUS.DATE) {
        return 'date';
    }
    return 'text';
};

const parseValueEnum = field => {
    const valueType = parseValueType(field.type, field.len);
    if (valueType != 'select') {
        return null;
    }
    if (field.type == COLUMN_STATUS.BOOLEAN) {
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
    if (field.type == COLUMN_STATUS.ENUM) {
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
const parsePageInfo = ({ model, ellipsisFieldList = [], operationList = [], showId = false }, handleEditClick, handleDelete, actionRef, detailHandler) => {
    const { modelMetaList } = window.USER;
    const modelMeta = modelMetaList.find(meta => meta.className == model);
    const { name, module, createable, updateable, deleteable, fieldList } = modelMeta;

    const baseUrl = '/ajax/' + module.toLowerCase() + '/' + (model.substr(model.lastIndexOf('.') + 1)).toLowerCase();
    const listUrl = baseUrl + '/listData';
    const saveUrl = baseUrl + '/save';
    const deleteUrl = baseUrl + '/delete/';

    const c = (field) => ({
        fieldType: field.type,
        fieldJavaType: field.javaType,
        fieldNullable: field.nullable,
        fieldLen: field.len,

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

    editColumns.splice(0, 0, c({
        label: 'ID',
        name: 'id',
        hideInForm: true,
    }));

    let opArr = [];
    if (updateable) {
        opArr.push({
        execute: record => handleEditClick({visible: true, isCreate: false, record, }),
        label: '编辑',
        });
    }
    if (deleteable) {
        opArr.push({
        type: 'danger',
        execute: record => handleDelete(record.id, actionRef, pageInfo),
        label: '删除',
        confirm: true,
        confirmText: '确认删除?',
        });
    }
    if (operationList.length > 0) {
        opArr = opArr.concat(operationList);
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
                    onConfirm={() => op.execute(record)}
                    //onCancel={cancel}
                    okText="确认"
                    cancelText="取消">
                    <Button type={op.type || 'normal'}>{op.label}</Button>
                </Popconfirm>
                );
            }
            return <Button key={opIndex ++} type={op.type || 'normal'} onClick={() => op.execute(record)}>{op.label}</Button>;
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
 * 处理对象值，目前主要是将时间类型转为字符串类型。后续有其他需要再加
 * @param {*} obj 表单值
 */
const processValues = obj => {
    if (!obj) {
        return obj;
    }
    Object.keys(obj).forEach(key => {
        let value = obj[key];
        if (value && value._isAMomentObject) {
            obj[key] = value.format('YYYY-MM-DD HH:mm:ss');
        }
    });
    return obj;
};

export { renderColumn, parsePageInfo, processValues };
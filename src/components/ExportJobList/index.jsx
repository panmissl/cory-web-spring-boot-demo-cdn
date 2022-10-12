import { Table, Tooltip, message } from 'antd';
import { useEffect, useState } from 'react';
import request from '@/utils/request';

/**
 * 导出任务组件。用来显示导出列表及下载文件
 * 用法：<ExportJobList type='xxx' />
 * @param {*} props
 *     type：后端在使用ExportJobService时设置的type
 *     showIp：是否显示执行任务的IP，默认显示
 *     showCreateTime：是否显示任务开始时间，默认显示
 *     showModifyTime：是否显示最近更新时间，默认显示
 */
const Component = (props) => {

  const { type, showIp = true, showCreateTime = true, showModifyTime = true } = props;

  if (!type) {
    message.error('使用ExportJobList组件时，type是必填属性');
    return;
  }

  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const columns = [
    {title: '任务编码', dataIndex: 'code', render: v => <Tooltip title={v}>{v.substr(v.length - 4, v.length) + '...'}</Tooltip>},
  ];
  if (showIp) {
    columns.push({title: '任务运行IP&端口', dataIndex: 'ip'});
  }
  if (showCreateTime) {
    columns.push({title: '开始时间', dataIndex: 'createTime'});
  }
  if (showModifyTime) {
    columns.push({title: '最近更新时间', dataIndex: 'modifyTime'});
  }
  columns.push({title: '状态', dataIndex: 'status', render: (v, r) => r.renderFieldMap['statusText']});
  columns.push({
    title: '下载', 
    render: (v, r) => {
      if (r.status === 'fail') {
        let shortMsg = r.errorMsg;
        if (shortMsg) {
          if (shortMsg.length > 5) {
            shortMsg = shortMsg.substr(0, 5) + '...';
          }
        } else {
          shortMsg = '无';
        }
        return <Tooltip title={`导出错误：${r.errorMsg || '无'}`}>导出错误：{shortMsg}</Tooltip>;
      } else if (r.status === 'success') {
        if (r.downloadUrl && r.downloadUrl.length > 0 && r.downloadUrl !== '-') {
          return <a href={r.downloadUrl} target='_blank'>点击下载</a>
        } else {
          return null;
        }
      } else {
        return '请等待任务完成后下载';
      }
    }
  });

  const fetchData = (pageNo, pageSize) => {
    setLoading(true);
    request.get(`${ctx}ajax/base/exportjob/listData?type=${type}&pageSize=${pageSize}&pageNo=${pageNo}`).then((p) => {
      setData(p.list);
      setLoading(false);
      setPagination({
        ...pagination,
        current: pageNo,
        total: p.totalCount,
        pageSize,
      });
    });
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (newPagination) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  return (
    <Table
      columns={columns}
      rowKey={(record) => record.id}
      dataSource={data}
      pagination={pagination}
      loading={loading}
      onChange={handleTableChange}
    />
  );
};

export default Component;

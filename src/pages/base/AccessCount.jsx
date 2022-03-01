import TableList from '@/components/TableList';
import { PageContainer } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import Echart from '@/components/Echart';
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from 'echarts/charts';
import request from '@/utils/request';

const buildOptions = (title, list) => {
  /*
  {
    title: {
      text: '',
    },
    xAxis: {},
    yAxis: {
      data: ['A', 'B', 'C', 'D'],
    },
    series: [{
      type: 'bar', 
      data: [1, 2, 3, 4]
    }],
  }
  */
  list.reverse();
  const yAxisData = (list || []).map(i => i.uri);
  const seriesData = (list || []).map(i => i.count);
  return {
    title: {
      text: title,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {},
    yAxis: {
      data: yAxisData,
    },
    series:[{
      type: 'bar',
      data: seriesData,
    }],
  };
};

const Page = () => {

  const [ todayOptions, setTodayOptions] = useState();
  const [ yesterdayOptions, setYesterdayOptions] = useState();
  const [ totalOptions, setTotalOptions] = useState();

  useEffect(() => {
    request(ctx + 'ajax/base/accesscount/stat').then(statInfo => {
      setTodayOptions(buildOptions('今日访问TOP 20', statInfo.today));
      setYesterdayOptions(buildOptions('昨日访问TOP 20', statInfo.yesterday));
      setTotalOptions(buildOptions('总访问TOP 20', statInfo.total));
    });
  }, []);

  return (
    <PageContainer>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%'}}>
        {todayOptions && <Echart divId='today' chart={BarChart} options={todayOptions} width={300} height={400} />}
        {yesterdayOptions && <Echart divId='yesterday' chart={BarChart} options={yesterdayOptions} width={300} height={400} />}
        {totalOptions && <Echart divId='total' chart={BarChart} options={totalOptions} width={300} height={400} />}
      </div>
      <TableList
        model="com.cory.model.AccessCount"
        showId={true}
        params={{ sort: 'ACCESS_COUNT DESC' }}
      />
    </PageContainer>
  );
};

export default Page;

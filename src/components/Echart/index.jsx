import { Input } from 'antd';
import { useEffect, useState } from 'react';
// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from 'echarts/core';
// 引入提示框，标题，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LegendComponent
} from 'echarts/components';
// 标签自动布局，全局过渡动画等特性
import { LabelLayout, UniversalTransition } from 'echarts/features';
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from 'echarts/renderers';

const DEFAULT_COMPONENT_LIST = [
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LegendComponent,
];

/**
 * 图表组件。文档：https://echarts.apache.org/handbook/zh/get-started
 * 用法：<Echart chart={} options={} componentList=[] width={300} height={100} />
 * @param {*} props
 *     divId：div的id
 *     chart：是什么图，比如饼图，那么传饼图的组件进来
 *     options：选项
 *     componentList：组件列表，可选。默认已经加了这几个组件了：TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LabelLayout, UniversalTransition, CanvasRenderer, LegendComponent，不用再传它们，有其它需要的才传
 *     width：宽度，可选，不传默认300
 *     height：高度，可选，不传默认100
 */
const Echart = (props) => {
  
  const { divId, chart, options, componentList = [], width = 300, height = 100 } = props;

  const comps = DEFAULT_COMPONENT_LIST.concat(chart).concat(componentList);

  // 注册必须的组件
  echarts.use(comps);

  useEffect(() => {
    // 接下来的使用就跟之前一样，初始化图表，设置配置项
    var myChart = echarts.init(document.getElementById(divId));
    myChart.setOption(options);
  }, []);

  return <div id={divId} style={{width: width + 'px', height: height + 'px'}}></div>;
};

export default Echart;

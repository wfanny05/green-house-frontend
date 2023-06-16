
<template>
  <div id="main">
  </div>
</template>

<script lang="ts">
import {
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons-vue';
import { defineComponent, ref, onMounted, watch, provide } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router'

import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;

export default defineComponent({
  components: {
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    AppstoreOutlined,
    ArrowLeftOutlined
  },
  props: {
    title: String,
    likes: Number,
    airTempList: Array,
    airHumidityList: Array,
    soilTempList: Array,
    soilHumidityList: Array,
    carbonDioxideLevelList: Array,
    illuminanceList: Array,
  },
  setup(props) {
    console.log('props', props)
    let airTempList = props.airTempList?.values || [] 
    const router = useRouter()
    const route = useRoute()

    const creatChart = () => {
      var chartDom = document.getElementById('main')!;
      console.log(chartDom)
      var myChart = echarts.init(chartDom);
      var option: EChartsOption;

      option = {
        title: {
          text: 'Temperature Change in the Coming Week'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {},
        toolbox: {
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            dataView: { readOnly: false },
            magicType: { type: ['line', 'bar'] },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} °C'
          }
        },
        series: [
          {
            name: '空气温度',
            type: 'line',
            data: [],
            markPoint: {
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
              ]
            },
            markLine: {
              data: [{ type: 'average', name: 'Avg' }]
            }
          },
          {
            name: 'Highest',
            type: 'line',
            data: [10, 11, 13, 11, 12, 12, 9],
            markPoint: {
              data: [
                { type: 'max', name: 'Max' },
                { type: 'min', name: 'Min' }
              ]
            },
            markLine: {
              data: [{ type: 'average', name: 'Avg' }]
            }
          },
          // {
          //   name: 'Lowest',
          //   type: 'line',
          //   data: [1, -2, 2, 5, 3, 2, 0],
          //   markPoint: {
          //     data: [{ name: '周最低', value: -2, xAxis: 1, yAxis: -1.5 }]
          //   },
          //   markLine: {
          //     data: [
          //       { type: 'average', name: 'Avg' },
          //       [
          //         {
          //           symbol: 'none',
          //           x: '90%',
          //           yAxis: 'max'
          //         },
          //         {
          //           symbol: 'circle',
          //           label: {
          //             position: 'start',
          //             formatter: 'Max'
          //           },
          //           type: 'max',
          //           name: '最高点'
          //         }
          //       ]
          //     ]
          //   }
          // }
        ]
      };

      option && myChart.setOption(option);
    }

    onMounted(() => {
      creatChart()
    })

    return {
    };
  },
});
</script>

<style scoped>
#main {
  width: 100%;
  min-width: 1200px;
  height: 600px;
}
</style>
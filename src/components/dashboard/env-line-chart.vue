
<template>
  <a-row :gutter="24">
    <a-col v-for="item in charts" :key="item.name" :span="8">
      <div :id="item.name" class="chart-container">
      </div>
    </a-col>
  </a-row>
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
import { defineComponent, ref, onMounted, watch, watchEffect, provide, computed } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router'

import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;

interface chartItem {
      name: string
      title: string
      dataOption: { [key:string]: any }
    }

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
    airTempOption: Object,
    airHumidityOption: Object,
    soilTempOption: Object,
    soilHumidityOption: Object,
    carbonDioxideLevelOption: Object,
    illuminanceOption: Object,
  },
  setup(props) {
    console.log('props', props)
    const airTempOption = computed(() => props.airTempOption)
    const airHumidityOption = computed(() => props.airHumidityOption || [] as number[])
    const soilTempOption = computed(() => props.soilTempOption || [] as number[])
    const soilHumidityOption = computed(() => props.soilHumidityOption || [] as number[])
    const carbonDioxideLevelOption = computed(() => props.carbonDioxideLevelOption || [] as number[])
    const illuminanceOption = computed(() => props.illuminanceOption || [] as number[])

    const router = useRouter()
    const route = useRoute()

    const charts: chartItem[] = [
      {
        name: 'airTemp',
        title: '空气温度',
        dataOption: airTempOption.value
      }, 
      {
        name: 'airHumidity',
        title: '空气湿度',
        dataOption: airHumidityOption.value
      }, 
      {
        name: 'soilTemp',
        title: '土壤温度',
        dataOption: soilTempOption.value
      },
      {
        name: 'soilHumidity',
        title: '土壤湿度',
        dataOption: soilHumidityOption.value
      },
      {
        name: 'illuminance',
        title: '光照度',
        dataOption: illuminanceOption.value
      },
      {
        name: 'carbonDioxideLevel',
        title: '二氧化碳浓度',
        dataOption: carbonDioxideLevelOption.value
      }
    ]

    let chartInstance = {}
    const creatChart = (item: chartItem) => {
      const { name, title, dataOption } = item
      var chartDom = document.getElementById(name)!;
      chartInstance[name] = chartInstance[name] || echarts.init(chartDom);
      var option: EChartsOption;
      // console.log('dataOption', dataOption)

      option = {
        title: {
          text: title
        },
        tooltip: {
          trigger: 'axis'
        },
        // legend: {},
        toolbox: {
          show: true,
          feature: {
            // dataZoom: {
            //   yAxisIndex: 'none'
            // },
            // dataView: { readOnly: false },
            // magicType: { type: ['line', 'bar'] },
            // restore: {},
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: dataOption.xAxisData,
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: `{value} ${dataOption.unit}`
          }
        },
        series: [
          {
            name: '空气温度',
            type: 'line',
            data: dataOption.seriesData,
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
        ]
      };

      option && chartInstance[name].setOption(option);
    }

    onMounted(() => {
    })

    // watch(airTempList, () => {
    //   creatChart()
    // }, {
    //   flush: 'post'
    // })

    watchEffect(() => {
      for (let index = 0; index < charts.length; index++) {
        const item = charts[index];
        creatChart(item)
      }
    }, {
      flush: 'post'
    })

    return {
      charts
    };
  },
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  min-width: 400px;
  height: 300px;
}
</style>
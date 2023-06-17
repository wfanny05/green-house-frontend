<template>
  <div id="main" class="chart-container"></div>
</template>
<script lang="ts">
import {
  UserOutlined,
} from '@ant-design/icons-vue';
import { defineComponent, ref, onMounted, watch, provide } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router'
import axiosInstance from '@/utils/axios-instance'
import * as echarts from 'echarts';
import geoJson from '@/assets/geo-shanghai.json'

export default defineComponent({
  components: {
  },
  setup() {
    console.log(666, geoJson)
    const router = useRouter()
    const route = useRoute()

    let data = []
    const areaList = geoJson.features.map((item: any) => {
      data.push({
        name: item.properties.name,
        value: Math.round(Math.random() * 10)
      })
      return {
        name: item.properties.name,
      }
    })

    async function greenHouseGroup() {
      // console.log(111, ids)
      const res = await axiosInstance({
        method: 'post',
        url: '/green-house/group',
        data: {
          opFun: 'COUNT',
          opFiled: 'id',
          groupFiled: 'Region'
        }
      })
      console.log('greenHouseGroup', res)
    }

    // greenHouseGroup()

    const createChart = () => {
      var chartDom = document.getElementById('main');
      var myChart = echarts.init(chartDom);
      var option;

      echarts.registerMap('SH', geoJson);

      option = {
          title: {
            text: '大棚地区分布',
            // subtext: 'Data from Wikipedia',
            // sublink:
            //   'http://zh.wikipedia.org/wiki/%E9%A6%99%E6%B8%AF%E8%A1%8C%E6%94%BF%E5%8D%80%E5%8A%83#cite_note-12'
          },
          tooltip: {
            trigger: 'item',
            formatter: '{b}<br/>{c} 个'
          },
          toolbox: {
            show: true,
            // orient: 'vertical',
            // left: 'right',
            // top: 'center',
            feature: {
              // dataView: { readOnly: false },
              // restore: {},
              saveAsImage: {}
            }
          },
          visualMap: {
            min: 0,
            max: 10,
            text: ['高', '低'],
            realtime: false,
            calculable: true,
            inRange: {
              color: ['lightskyblue', 'yellow', 'orangered']
            }
          },
          series: [
            {
              name: '大棚地区分布',
              type: 'map',
              map: 'SH',
              label: {
                show: true
              },
              data,
            }
          ]
        }

      option && myChart.setOption(option);
    }

    onMounted(() => {
      createChart()
    })

    return {
    };
  },
});

</script>

<style scoped>
.chart-container {
  width: 100%;
  min-width: 400px;
  height: 730px;
}
</style>



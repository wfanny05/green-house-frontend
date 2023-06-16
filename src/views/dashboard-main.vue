<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons-vue';
import envLineChart from '../components/dashboard/env-line-chart.vue'
import axiosInstance from '@/utils/axios-instance';
import { mockEnvData } from '../utils/mock'


const greenHouseList = ref([])

const greenHouseQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/green-house/page',
    data: {
      select: 'id,greenHouseCode,GreenHouseNameNew',
      pageNo: 1,
      pageSize: 100,
    }
  })
  console.log('greenHouseQuery', res.data)
  greenHouseList.value = res.data.data.list
  return res.data
}

greenHouseQuery()

const airTempList = ref<number[]>([])
const airHumidityList = ref<number[]>([])
const soilTempList = ref<number[]>([])
const soilHumidityList = ref<number[]>([])
const carbonDioxideLevelList = ref<number[]>([])
const illuminanceList = ref<number[]>([])
const currentEnv = ref({
  airTemp: 0,
  airHumidity: 0,
  soilTemp: 0,
  soilHumidity: 0,
  carbonDioxideLevel: 0,
  illuminance: 0,
})

const envInfoQuery = async (greenHouseId: number) => {
  const res = await axiosInstance({
    method: 'post',
    url: '/env-info/page',
    data: {
      pageNo: 1,
      pageSize: 1000,
      greenHouseId
    }
  })
  airTempList.value = []
  airHumidityList.value = []
  soilTempList.value = []
  soilHumidityList.value = []
  carbonDioxideLevelList.value = []
  illuminanceList.value = []

  const envData = res.data.data.list || []
  for (let index = 0; index < envData.length; index++) {
    const item = envData[index];
    airTempList.value[index] = item.AirTemp
    airHumidityList.value[index] = item.AirHumidity
    soilTempList.value[index] = item.SoilTemp
    soilHumidityList.value[index] = item.SoilHumidity
    carbonDioxideLevelList.value[index] = item.CarbonDioxideLevel
    illuminanceList.value[index] = item.Illuminance
    if (index == 0) {
      currentEnv.value.airTemp = item.AirTemp
      currentEnv.value.airHumidity = item.AirHumidity
      currentEnv.value.soilTemp = item.SoilTemp
      currentEnv.value.soilHumidity = item.SoilHumidity
      currentEnv.value.carbonDioxideLevel = item.CarbonDioxideLevel
      currentEnv.value.illuminance = item.Illuminance
    }
  }

  return res.data
}

envInfoQuery(54)


</script>

<template>
  <div class="dashboard">
    <a-button @click="mockEnvData(24)">Mock 环境数据</a-button>
    <div class="container">
      <div class="container-header">
        <div class="container-title">大棚监测信息</div>
      </div>
      <div class="container-content">
        <a-row>
          <a-col :span="12">
            <a-statistic title="空气温度" :value="currentEnv.airTemp" style="margin-right: 50px" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="空气湿度" :value="currentEnv.airHumidity" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="土壤温度" :value="currentEnv.soilTemp" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="土壤湿度" :value="currentEnv.soilHumidity" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="光照度" :value="currentEnv.illuminance" />
          </a-col>
          <a-col :span="12">
            <a-statistic title="二氧化碳浓度" :value="currentEnv.carbonDioxideLevel" />
          </a-col>
        </a-row>
      </div>
    </div>
    <div class="container">
      <div class="container-header">
        <div class="container-title">大棚环境监测</div>
      </div>
      <div class="container-content">
        <envLineChart 
          title="哈哈哈哈"
          :airTempList="airTempList"
          :airHumidityList="airHumidityList"
          :soilTempList="soilTempList"
          :soilHumidityList="soilHumidityList"
          :carbonDioxideLevelList="carbonDioxideLevelList"
          :illuminanceList="illuminanceList"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 24px;
}
.container {
  background-color: #fff;
  border: 1px solid #d9d9d9;
  margin-bottom: 36px;
}
.container-title {
  /* font-size: 16px; */
  font-weight: bold;
  padding: 16px 24px;
  border-bottom: 1px solid #d9d9d9;
}
.container-content {
  padding: 24px;
  
}
</style>


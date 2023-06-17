<script setup lang="ts">
import { reactive, onBeforeMount, watch, watchEffect, ref, toRefs, computed } from 'vue'
import { ArrowUpOutlined, ArrowDownOutlined, LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';
import envLineChart from '../components/dashboard/env-line-chart.vue'
import greenHouseMap from '../components/dashboard/green-house-map.vue'
import axiosInstance from '@/utils/axios-instance';
import { mockEnvData } from '../utils/mock'


const greenHouseList = ref([])
const greenHouseId = ref(54)
const greenHouseId2 = ref(54)
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
  
  greenHouseList.value = res.data.data.list || []
  // greenHouseList.value.length > 0 && (greenHouseId2.value = greenHouseList.value[0].id)
  return res.data
}
greenHouseQuery()

let plantImage = ref([])
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE
const getPlantImage = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/plant/page',
    data: {
      pageNo: 1,
      pageSize: 100,
      greenHouseId: greenHouseId.value,
      sample: true,
    }
  })
  console.log('plantQuery', res.data.data.list)
  const plants = res.data.data.list || []
  plantImage.value = []
  for (let index = 0; index < plants.length; index++) {
    const item = plants[index];
    const res = await axiosInstance({
      method: 'post',
      url: '/plant-image/page',
      data: {
        pageNo: 1,
        pageSize: 4,
        plantId: item.id
      }
    })
    const list = (res.data.data.list || []).map(item => {
      return {
        ...item,
        url: `${import.meta.env.VITE_BACKEND_URL}${item.PictureSite}`
      }
    })
    plantImage.value = plantImage.value.concat(list)
  }
  console.log('plantImage', plantImage.value)
  return res.data
}
getPlantImage()


const selectedTime = ref(0)
const timeList = [
  {
    label: '今日',
    value: 'day',
    hours: 24
  },
  {
    label: '最近一周',
    value: 'week',
    hours: 7*24
  },
  {
    label: '最近一月',
    value: 'month',
    hours: 30*24
  },
]
let airTempOption = ref<{[key: string]: any}>({})
let airHumidityOption = ref<{[key: string]: any}>({})
let soilTempOption = ref<{[key: string]: any}>({})
let soilHumidityOption = ref<{[key: string]: any}>({})
let carbonDioxideLevelOption = ref<{[key: string]: any}>({})
let illuminanceOption = ref<{[key: string]: any}>({})
let currentEnv = ref({
  airTemp: 0,
  airHumidity: 0,
  soilTemp: 0,
  soilHumidity: 0,
  carbonDioxideLevel: 0,
  illuminance: 0,
})

const getCurrentEnv = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/env-info/page',
    data: {
      pageNo: 1,
      pageSize: 1,
      greenHouseId: greenHouseId.value
    }
  })
  const envData = res.data.data.list || []
  const current = envData[0] || []
  currentEnv.value.airTemp = current.AirTemp || 0
  currentEnv.value.airHumidity = current.AirHumidity || 0
  currentEnv.value.soilTemp = current.SoilTemp || 0
  currentEnv.value.soilHumidity = current.SoilHumidity || 0
  currentEnv.value.carbonDioxideLevel = current.CarbonDioxideLevel || 0
  currentEnv.value.illuminance = current.Illuminance || 0

  console.log('getCurrentEnv', res)
}

const envInfoQuery = async () => {
  const pageSize = timeList[selectedTime.value].hours
  const res = await axiosInstance({
    method: 'post',
    url: '/env-info/page',
    data: {
      pageNo: 1,
      pageSize,
      greenHouseId2: greenHouseId2.value
    }
  })

  const envData = res.data.data.list || []
  
  let airTemp$: {[key: string]: any} = {}
  let airHumidity$: {[key: string]: any} = {}
  let soilTemp$: {[key: string]: any} = {}
  let soilHumidity$: {[key: string]: any} = {}
  let carbonDioxideLevel$: {[key: string]: any} = {}
  let illuminance$: {[key: string]: any} = {}

  const keys = ['seriesData', 'xAxisData']
  keys.forEach(key => {
    airTemp$[key] = []
    airHumidity$[key] = []
    soilTemp$[key] = []
    soilHumidity$[key] = []
    carbonDioxideLevel$[key] = []
    illuminance$[key] = []
  })
  
  for (let index = 0; index < envData.length; index++) {
    const item = envData[index];

    airTemp$.seriesData[index] = item.AirTemp
    airTemp$.unit = '°C'
    airTemp$.xAxisData[index] = item.RecordDate

    airHumidity$.seriesData[index] = item.AirHumidity
    airHumidity$.unit = '%'
    airHumidity$.xAxisData[index] = item.RecordDate

    soilTemp$.seriesData[index] = item.SoilTemp
    soilTemp$.unit = '°C'
    soilTemp$.xAxisData[index] = item.RecordDate

    soilHumidity$.seriesData[index] = item.SoilHumidity
    soilHumidity$.unit = '%'
    soilHumidity$.xAxisData[index] = item.RecordDate

    carbonDioxideLevel$.seriesData[index] = item.CarbonDioxideLevel
    carbonDioxideLevel$.unit = 'ppm'
    carbonDioxideLevel$.xAxisData[index] = item.RecordDate

    illuminance$.seriesData[index] = item.Illuminance
    illuminance$.unit = 'lux'
    illuminance$.xAxisData[index] = item.RecordDate
  }

  keys.forEach(key => {
    airTempOption.value[key] = airTemp$[key]
    airHumidityOption.value[key] = airHumidity$[key]
    soilTempOption.value[key] = soilTemp$[key]
    soilHumidityOption.value[key] = soilHumidity$[key]
    carbonDioxideLevelOption.value[key] = carbonDioxideLevel$[key]
    illuminanceOption.value[key] = illuminance$[key]
  })

  airTempOption.value.unit = airTemp$.unit
  airHumidityOption.value.unit = airHumidity$.unit
  soilTempOption.value.unit = soilTemp$.unit
  soilHumidityOption.value.unit = soilHumidity$.unit
  carbonDioxideLevelOption.value.unit = carbonDioxideLevel$.unit
  illuminanceOption.value.unit = illuminance$.unit

  const current = envData[0] || []
  currentEnv.value.airTemp = current.AirTemp || 0
  currentEnv.value.airHumidity = current.AirHumidity || 0
  currentEnv.value.soilTemp = current.SoilTemp || 0
  currentEnv.value.soilHumidity = current.SoilHumidity || 0
  currentEnv.value.carbonDioxideLevel = current.CarbonDioxideLevel || 0
  currentEnv.value.illuminance = current.Illuminance || 0
  
  console.log('envInfoQuery')

  return res.data
}

envInfoQuery()

watch(greenHouseId, (value, old, onCleanup) => {
  let update = true;
  onCleanup(() => {
    update = false;
  })
  if(update) {
    getCurrentEnv()
    getPlantImage()
  }
})

watchEffect((onCleanup) => {
  let update = true;
  onCleanup(() => {
    update = false;
  })
  if(update) {
    envInfoQuery()
  }
})

const getPopupContainer = (triggerNode) => {
  return triggerNode.parentNode
}

</script>

<template>
  <div class="dashboard">
    <a-button @click="mockEnvData(7 * 24)">Mock 环境数据</a-button>
    
    <a-row :gutter="24">
      <a-col :span="12">
        <div class="container">
          <div class="container-header">
            <div class="container-title">大棚当前信息</div>
            <div class="container-action">
              <a-select
                ref="select"
                v-model:value="greenHouseId"
                style="width: 200px"
                :getPopupContainer="getPopupContainer"
              >
                <a-select-option v-for="item in greenHouseList" :key="item.id" :value="item.id">{{ item.greenhouseName }}</a-select-option>
              </a-select>
            </div>
          </div>
          <div class="container-content">
            <a-row style="margin-bottom: 24px;">
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
            <div>
              <!-- <h3></h3> -->
              <a-empty v-if="plantImage.length === 0" class="plant-empty" :image="simpleImage" description="暂无作物"/>
              <a-carousel v-else arrows>
                <template #prevArrow>
                  <div class="custom-slick-arrow" style="left: 10px; z-index: 1">
                    <left-circle-outlined />
                  </div>
                </template>
                <template #nextArrow>
                  <div class="custom-slick-arrow" style="right: 10px">
                    <right-circle-outlined />
                  </div>
                </template>
                <div v-for="item in plantImage" :key="item.id">
                  <div class="plant-image">
                    <img 
                      :src="item.url" 
                    />
                    <div class="plant-image-desc">{{ item.Description }}</div>
                  </div>
                </div>
              </a-carousel>
            </div>
          </div>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="container">
          <!-- <div class="container-header">
            <div class="container-title">大棚地区分布</div>
          </div> -->
          <div class="container-content">
            <greenHouseMap />
          </div>
        </div>
      </a-col>
    </a-row>
    
    <div class="container">
      <div class="container-header">
        <div class="container-title">大棚环境监测</div>
        <div class="container-action">
          <a-radio-group v-model:value="selectedTime">
            <a-radio-button v-for="(item, index) in timeList" :value="index" :key="index">{{item.label}}</a-radio-button>
          </a-radio-group>
          <a-select
            ref="select"
            v-model:value="greenHouseId2"
            style="width: 200px"
            :getPopupContainer="getPopupContainer"
          >
            <a-select-option v-for="item in greenHouseList" :key="item.id" :value="item.id">{{ item.greenhouseName }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="container-content">
        <envLineChart 
          :airTempOption="airTempOption"
          :airHumidityOption="airHumidityOption"
          :soilTempOption="soilTempOption"
          :soilHumidityOption="soilHumidityOption"
          :carbonDioxideLevelOption="carbonDioxideLevelOption"
          :illuminanceOption="illuminanceOption"
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
.container-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #d9d9d9;
  padding: 4px 24px;
  height: 64px;
}
.container-title {
  /* font-size: 16px; */
  font-weight: bold;
}
.container-action {
}
.container-action > div {
  margin-left: 8px;
}
.container-content {
  padding: 24px;
}
.plant-image {
  /* position: relative; */
}
.plant-image::v-deep > img{
  width: 100%;
  /* height: 100%; */
}
.plant-image-desc {
  /* position: absolute;
  bottom: 0; */
  width: 100%;
  /* background-color: rgba(255, 255, 255, 0.5); */
  height: 60px;
  padding: 8px 24px;
  /* color: #fff; */
}
.plant-empty {
  min-height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.ant-carousel :deep(.slick-slide) {
  /* text-align: center; */
  /* height: 160px; */
  /* line-height: 160px; */
  /* background: #364d79; */
  /* overflow: hidden; */
}
.ant-carousel :deep(.slick-arrow.custom-slick-arrow) {
  width: 32px;
  height: 32px;
  font-size: 32px;
  color: #fff;
  background-color: rgba(31, 45, 61, 0.11);
  opacity: 0.8;
  z-index: 1;
}
.ant-carousel :deep(.custom-slick-arrow:before) {
  display: none;
}
.ant-carousel :deep(.custom-slick-arrow:hover) {
  opacity: 0.5;
}

.ant-carousel :deep(.slick-slide h3) {
  color: #333;
}
</style>


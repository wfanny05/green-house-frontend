<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed, inject } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue';

const backendUrl = 'http://localhost:6166'
const router = useRouter()
const route = useRoute()

interface Stage {
  GrowingStage: string // 生命周期
  CeilingGrowingDays: number // 生长天数上限
  FloorGrowingDays: number // 生长天数下限
  CeilingTemp: number // 温度上限
  FloorAirTemp: number // 温度下限
  CeilingAirHumidiy: number // 空气湿度上限
  FloorAirHumidity: number // 空气湿度下限
  CeilingSoilTemp: number // 土壤温度上限
  FloorSoilTemp: number // 土壤温度下限
  CeilingSoilHumidity: number // 土壤湿度上限
  FloorSoilHumidity: number // 土壤湿度下限
  CeilingCarbonLevel: number // 二氧化碳浓度上限
  FloorCarbonLevel: number // 二氧化碳浓度下限
  Ceilingilluminance: number // 光照强度上限
  Floorilluminance: number // 光照强度下限
}

interface FormState { 
  PlantName: string
  Category: string
  Supplier: string
  SupplierTel: string
  Pictures: number
  Measures: string
  Note: string
  stage1: Stage
  stage2: Stage
  stage3: Stage
  stage4: Stage
  stage5: Stage
  [key: string]: any
}

async function seedGet() : Promise<FormState>{
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed/get',
    data: {
      id: seedId.value
    }
  })
  console.log('seedGet', res.data?.data?.data)
  const seed = res.data?.data?.data || {}
  Object.keys(formState).forEach((key: string) => {
    // console.log('key', key, res[key])
    if (key == 'Pictures') {
      formState[key] = Number(seed[key])
    } else {
      formState[key] = seed[key]
    }
  })
  getCoverPicture(Number(formState.Pictures))
  return seed
}

async function seedAddOrUpdate() {
  let item = {
    ...formState
  }
  let stages:any = {}
  for (let i = 1; i <= 5; i++) {
    delete item[`stage${i}`]
    stages[`stage${i}`] = formState[`stage${i}`]
  }
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed/add-or-update',
    data: {
      id: seedId.value,
      item,
      ...stages
    }
  })
  await seedGet()
  isEdit.value = false
  console.log('seedAddOrUpdate', res)
}

const seedGalleryQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed-gallery/page',
    data: {
      pageNo: 1,
      pageSize: 100,
    }
  })
  console.log('seedGalleryQuery', res.data)
  PicturesList.value = res.data.data.list
  console.log(PicturesList.value)
  return res.data
}

async function getCoverPicture(PictureSetID: number): Promise<void> {
  if(!PictureSetID) return
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed-image/page',
    data: {
      PictureSetID,
      pageSize: 1,
    }
  })
  console.log('getCoverPicture', res.data?.data)
  coverPicture.value = res.data?.data?.list[0]
  coverPicture.value.url = `${backendUrl}${coverPicture.value.PictureAddress}`
  // return coverPicture
  // return res.data?.data?.list || {}
}

let seedId = ref(route.query.id)

let isEdit = ref(false)
isEdit.value = route.query.edit == '1' ? true : seedId.value ? false : true // true 新增&编辑；false 详情
const toEdit = () => {
  isEdit.value = true
}
const cancelEdit = () => {
  isEdit.value = false
}
const formRef = ref<FormInstance>();
const formState = reactive<FormState>({
  PlantName: '',
  Category: '',
  Supplier: '',
  SupplierTel: '',
  Pictures: 0,
  Measures: '',
  Note: '',
  stage1: {},
  stage2: {},
  stage3: {},
  stage4: {},
  stage5: {},
});
const onFinish = async (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  await seedAddOrUpdate()
  if(seedId.value) {
    message.success('更新成功！');
  } else {
    message.success('新增成功！');
  }
};

let showStage = ref('stage1')

const numberValidator = (rule: any) => {
  // console.log('numberValidator', rule)
  const attrs = rule.field.split('.')
  const newVal = formState[attrs[0]][attrs[1]]
  return new Promise((resolve, reject) => {
    resolve('');
    // if (!newVal) {
    //   reject('请输入数值！');  // reject with error message
    // } else {
    //   resolve('');
    // }
  });
}

const goBack = () => {
  router.push({
    path: '/seed-list',
  })
}

const pageTitlePush = inject('pageTitlePush') as (title: string, url: string) => void
const title = route.query.edit == '1' ? '编辑种子' : seedId.value ? '种子详情': '新增种子'
pageTitlePush(title, '/seed-list')

const PicturesList = ref<{
  id: number
  PictureName: string
}[]>([]) // 图集列表
seedGalleryQuery()

let coverPicture = ref<{
  id?: number
  PictureName?: string
  PictureAddress?: string
  url?: string
}>({})

const viewPictures = () => {
  router.push({
    path: '/seed-gallery-form',
    query: {
      id: formState.Pictures,
    }
  })
}
if (seedId.value) {
  const res = await seedGet()
}

onBeforeMount(async () => {

})
</script>

<template>
  <div class="seed-list-form">
    <a-form
      ref="formRef"
      name="advanced_search"
      class="ant-advanced-search-form"
      :model="formState"
      @finish="onFinish"
    >
    <div class="action">
      <a-button v-if="isEdit" type="primary" html-type="submit">提交</a-button>
      <a-button v-else @click="toEdit">编辑</a-button>
      <a-button v-if="isEdit && seedId" @click="cancelEdit">取消</a-button>
    </div>
    <div class="form-title">基本信息</div>
    <a-row :gutter="24">
      <a-col :span="8">
        <a-form-item
          name="PlantName"
          label="种子名称"
          :rules="[{ required: isEdit, message: '请输入种子名称!' }]"
        >
          <a-input v-if="isEdit" v-model:value="formState.PlantName" placeholder=""></a-input>
          <div v-else>{{ formState.PlantName }}</div>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          name="Category"
          label="种子品种"
          :rules="[{ required: isEdit, message: '请输入种子品种!' }]"
        >
          <a-input v-if="isEdit" v-model:value="formState.Category" placeholder=""></a-input>
          <div v-else>{{ formState.Category }}</div>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          name="Supplier"
          label="供应商"
          :rules="[{ required: isEdit, message: '请输入供应商!' }]"
        >
          <a-input v-if="isEdit" v-model:value="formState.Supplier" placeholder=""></a-input>
          <div v-else>{{ formState.Supplier }}</div>
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          name="SupplierTel"
          label="供应商电话"
          :rules="[{ required: isEdit, message: '请输入供应商电话!' }]"
        >
          <a-input v-if="isEdit" v-model:value="formState.SupplierTel" placeholder=""></a-input>
          <div v-else>{{ formState.SupplierTel }}</div>
        </a-form-item>
      </a-col>
    </a-row>
    <a-divider></a-divider>

    <div class="form-title">生命周期</div>
    <a-radio-group v-model:value="showStage" class="stage-select">
      <a-radio-button value="stage1">萌发期</a-radio-button>
      <a-radio-button value="stage2">幼苗期</a-radio-button>
      <a-radio-button value="stage3">生长期</a-radio-button>
      <a-radio-button value="stage4">开花期</a-radio-button>
      <a-radio-button value="stage5">结果期</a-radio-button>
    </a-radio-group>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">生长天数:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.FloorGrowingDays`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].FloorGrowingDays" placeholder=""></a-input-number>
              <div v-else>{{ Number(formState[showStage].FloorGrowingDays) }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.CeilingGrowingDays`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].CeilingGrowingDays" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].CeilingGrowingDays }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(天)</div>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">适宜的空气温度:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.FloorAirTemp`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].FloorAirTemp" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].FloorAirTemp }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.CeilingTemp`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].CeilingTemp" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].CeilingTemp  }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(°C)</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">适宜的土壤温度:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.FloorSoilTemp`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].FloorSoilTemp" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].FloorSoilTemp }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.CeilingSoilTemp`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].CeilingSoilTemp" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].CeilingSoilTemp  }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(°C)</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">适宜的光照度:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.Floorilluminance`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].Floorilluminance" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].Floorilluminance }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.Ceilingilluminance`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].Ceilingilluminance" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].Ceilingilluminance  }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(lux)</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">适宜的空气湿度:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.FloorAirHumidity`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].FloorAirHumidity" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].FloorAirHumidity }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.CeilingAirHumidiy`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].CeilingAirHumidiy" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].CeilingAirHumidiy  }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(%)</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">适宜的土壤湿度:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.FloorSoilHumidity`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].FloorSoilHumidity" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].FloorSoilHumidity }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.CeilingSoilHumidity`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].CeilingSoilHumidity" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].CeilingSoilHumidity  }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(%)</div>
          </div>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="stage-attr">
          <div class="stage-attr-label">适宜的二氧化碳浓度:</div>
          <div class="stage-value">
            <a-form-item
              :name="`${showStage}.FloorCarbonLevel`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].FloorCarbonLevel" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].FloorCarbonLevel }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;-&nbsp;</div>
            <a-form-item
              :name="`${showStage}.CeilingCarbonLevel`"
              :rules="[{ validator: numberValidator }]"
            >
              <a-input-number v-if="isEdit" v-model:value="formState[showStage].CeilingCarbonLevel" placeholder=""></a-input-number>
              <div v-else>{{ formState[showStage].CeilingCarbonLevel  }}</div>
            </a-form-item>
            <div class="ant-row ant-form-item">&nbsp;(ppm)</div>
          </div>
        </div>
      </a-col>
    </a-row>
    <a-divider></a-divider>

    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          name="Pictures"
          label="关联图集"
        >
          <a-select
            v-if="isEdit"
            ref="select"
            v-model:value="formState.Pictures"
            style="width: 200px"
          >
            <a-select-option v-for="item in PicturesList" :key="item.id" :value="item.id">{{ item.PictureName }}</a-select-option>
          </a-select>
          <a-image
            v-else
            :width="100"
            :src="coverPicture.url"
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
          />
          <a-button @click="viewPictures">查看图集</a-button>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          name="Measures"
          label="技术措施"
        >
          <a-textarea v-if="isEdit" v-model:value="formState.Measures" placeholder=""></a-textarea>
          <div v-else>{{ formState.Measures }}</div>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          name="Note"
          label="备注"
        >
          <a-textarea v-if="isEdit" v-model:value="formState.Note" placeholder=""></a-textarea>
          <div v-else>{{ formState.Note }}</div>
        </a-form-item>
      </a-col>
    </a-row>
    </a-form>
  </div>
</template>

<style scoped>
.seed-list-form {
  position: relative;
}
.action {
  position: absolute;
  top: 0;
  right: 0;
}

.action .ant-btn {
  margin-left: 8px;
}

.form-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 24px;
}
.stage-select {
  margin-bottom: 24px;
}
.stage-attr {
  display: flex;
}
.stage-attr-label {
  /* width: 80px; */
  line-height: 32px;
  /* text-align: right; */
  margin-right: 8px;
  margin-bottom: 24px;
}
.stage-value {
  flex: 1;
  display: flex;
  align-items: baseline;
}
</style>


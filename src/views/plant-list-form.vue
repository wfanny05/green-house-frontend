<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRef, toRefs, computed, inject } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance } from 'ant-design-vue'
import { message } from 'ant-design-vue';
import {
  UploadOutlined,
  FormOutlined
} from '@ant-design/icons-vue';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { compareImageSimilarity } from '@/utils/compare-image'

const router = useRouter()
const route = useRoute()

interface FormState { 
  PlantName: string;
  seedName: string;
  seedId: number;
  greenHouseName: string;
  greenHouseId: number;
  PlantedDate: string | Dayjs;
  Days: number;
  PlantStatus: string;
  PlantStatusName: string;
  HarvestDate: string | Dayjs;
  Output: number
  Area_m2: number
  [key: string]: any
}
interface ImageFormState {
  checked?: boolean
  id?: number
  PictureName: string
  Description: string
  PictureType: string
  PictureSite?: string
  fileList: any
  [key: string]: any
}

const seedList = ref([])
const getAllSeed = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed/page',
    data: {
      pageNo: 1,
      pageSize: 100,
    }
  })
  seedList.value = res.data.data.list || []
  console.log('getAllSeed', res.data)
  return res.data
}
getAllSeed()

const greenHouseList = ref([])
const getAllGreenHouse = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/green-house/page',
    data: {
      pageNo: 1,
      pageSize: 100,
    }
  })
  greenHouseList.value = res.data.data.list || []
  console.log('getAllGreenHouse', res.data)
  return res.data
}
getAllGreenHouse()


async function plantGet() : Promise<FormState>{
  const res = await axiosInstance({
    method: 'post',
    url: '/plant/get',
    data: {
      id: plantId.value
    }
  })
  console.log('plantGet', res.data?.data?.data)
  return res.data?.data?.data || {}
}

async function plantUpdate() {
  let item = {
    ...formState,
  }
  if(formState.PlantedDate) {
    item.PlantedDate = formState.PlantedDate.format('YYYY-MM-DD')
  }
  if(formState.HarvestDate) {
    item.HarvestDate = formState.HarvestDate.format('YYYY-MM-DD')
  }
  // console.log(99999, item)
  const res = await axiosInstance({
    method: 'post',
    url: '/plant/update',
    data: {
      id: plantId.value,
      item,
    }
  })
  await detailGet()
  isEdit.value = false
  console.log('plantUpdate', res)
}

async function plantImageAdd(): Promise<ImageFormState> {
  var formData = new FormData()
  for (var i = 0; i < imageFormState.fileList.length; i++) {
    formData.append("fileList", imageFormState.fileList[i]);
  }
  formData.append('PictureName', imageFormState.PictureName)
  formData.append('Description', imageFormState.Description)
  formData.append('plantId', plantId.value)
  const res = await axiosInstance({
    method: 'post',
    url: '/plant-image/add',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
  console.log('plantImageAdd', res)
  return res.data?.data || {}
}

async function plantImageUpdate(): Promise<ImageFormState> {
  var formData = new FormData()
  for (var i = 0; i < imageFormState.fileList.length; i++) {
    formData.append("fileList", imageFormState.fileList[i]);
  }
  formData.append('id', editImageId+'')
  formData.append('PictureName', imageFormState.PictureName)
  formData.append('PictureType', imageFormState.PictureType)
  formData.append('Description', imageFormState.Description)
  formData.append('plantId', plantId.value)
  const res = await axiosInstance({
    method: 'post',
    url: '/plant-image/update',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
  console.log('plantImageUpdate', res)
  return res.data?.data || {}
}

async function plantImageMultiDelete() {
  const ids = imageList.value.filter(item => item.checked).map(item => item.id).join(',')
  const imagePaths = imageList.value.filter(item => item.checked).map(item => item.PictureSite)
  if(!ids) {
    message.error('请选择要删除的图片');
    return
  }
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: '/plant-image/multi-del',
    data: {
      ids,
      imagePaths
    }
  })
  console.log('plantImageMultiDelete', res)
  await detailGet()
}

async function plantImageQuery(plantId: number): Promise<ImageFormState[]> {
  const res = await axiosInstance({
    method: 'post',
    url: '/plant-image/page',
    data: {
      plantId,
      pageSize: 100,
    }
  })
  console.log('plantImageQuery', res.data?.data)
  return res.data?.data?.list || {}
}

const PlantedDateText = ref('')
const HarvestDateText = ref('')
const PictureSetID = ref('')
const detailGet = async () => {
  if(plantId.value) {
    const res = await plantGet()
    PictureSetID.value = res.PictureSetID || ''
    Object.keys(formState).forEach((key: string) => {
      // console.log('key', key, res[key])
      if(key === 'PlantedDate') {
        PlantedDateText.value = res[key]
        formState[key] = dayjs(res[key] || undefined)
      } else if (key === 'HarvestDate') {
        HarvestDateText.value = res[key]
        formState[key] = formState[key] ? dayjs(res[key]) : ''
      } else {
        formState[key] = res[key]
      }
    })
    const list = await plantImageQuery(res.id)
    imageList.value = list.map(item => ({
      ...item,
      url: `${import.meta.env.VITE_BACKEND_URL}${item.PictureSite}`,
      PictureTypeObj: PlantStatusArr[Number(item.PictureType) - 1],
      checked: false,
    }))
  }
}

let plantId = ref<string>(route.query.id as string)
let isEdit = ref(false)
!plantId.value && (isEdit.value = true)
const toEdit = () => {
  isEdit.value = true
}
const cancelEdit = () => {
  isEdit.value = false
}
const formRef = ref<FormInstance>();
const formState = reactive<FormState>({
  PlantName: '',
  seedName: '',
  seedId: 0,
  greenHouseName: '',
  greenHouseId: 0,
  PlantedDate: '',
  Days: 0,
  PlantStatus: '',
  PlantStatusName: '',
  HarvestDate: '',
  Output: 0,
  Area_m2: 0,
});
const onFinish = async (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  await plantUpdate()
  message.success('更新成功！');
};

const PlantStatusArr = [{
  label: '萌发期',
  value: '1',
  color: 'pink'
}, {
  label: '幼苗期',
  value: '2',
  color: 'green'
}, {
  label: '生长期',
  value: '3',
  color: 'blue'
}, {
  label: '开花期',
  value: '4',
  color: 'purple'
}, {
  label: '结果期',
  value: '5',
  color: 'orange'
}]

const imageFormRef = ref<FormInstance>();
const imageFormState = reactive<ImageFormState>({
  PictureName: '',
  Description: '',
  PictureType: '',
  fileList: [],
});
let isEditImage = ref(false)
let editImageId: number | undefined
const addImage = () => {
  isEditImage.value = true
  editImageId = undefined
  imageFormState.PictureName = ''
  imageFormState.PictureType = ''
  imageFormState.Description = ''
}
const cancelAddImage = () => {
  isEditImage.value = false
}
const loading = ref<boolean>(false);
const handleEditImage = async () => {
  const form = imageFormRef.value as FormInstance;
  form.validate().then(async () => {
    const res =  editImageId ? (await plantImageUpdate()): (await plantImageAdd())
    detailGet()
    isEditImage.value = false
  }).catch(err => {
    console.log('error', err);
  });
}
const beforeUpload = (file: any) => {
  console.log('beforeUpload', file);
  imageFormState.fileList = [file];
  return false
}
const updateImage = (item: ImageFormState) => {
  isEditImage.value = true
  editImageId = item.id
  imageFormState.PictureName = item.PictureName
  imageFormState.PictureType = item.PictureType
  imageFormState.Description = item.Description
}
let imageList = ref<ImageFormState[]>([])
const onImageCheck = (index: number) => {
  console.log('onImageCheck', index, imageList.value[index].checked )
}

const selectAll = () => {
  imageList.value.forEach(item => {
    item.checked = true
  })
}
const selectNone = () => {
  imageList.value.forEach(item => {
    item.checked = false
  })
}

let seedImage:{[key: string]: string} = {}
const getSeedImage = async (type: string) => {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-image/page',
    data: {
      PictureSetID: PictureSetID.value,
      PictureType: type,
      pageSize: 100,
    }
  })
  seedImage[type] = res.data?.data?.list || []
} 

const detectResultColumns = [
  {
    title: '标准图片',
    dataIndex: 'seedImageName',
    key: 'seedImageName',
    // slots: { customRender: 'seedImage' },
  },
  {
    title: '相似度',
    dataIndex: 'similarity',
    key: 'similarity',
    // slots: { customRender: 'similarity' },
  },
]
const detectLoading = ref(false)
const detectResult = ref<any[]>([])
const detect = async (data) => {
  // console.log('detect', data, PictureSetID.value)
  detectLoading.value = true
  // const res = await compareImageSimilarity('/api/static/green-house/img/16869924643782152.jpg',
  // '/api/static/green-house/img/16869924643782152.jpg')

  if(!seedImage[data.PictureType]) {
    await getSeedImage(data.PictureType)
  }

  if(seedImage[data.PictureType].length === 0) {
    message.error('种子未设置该类型标准图片')
    detectLoading.value = false
    return
  }

  let result = []
  for(let i = 0; i < seedImage[data.PictureType].length; i++) {
    const item = seedImage[data.PictureType][i]
    console.log('item', i, item)
    let similarity = await compareImageSimilarity('/api'+item.PictureAddress, '/api'+data.PictureSite)
    similarity = similarity * 100

    result.push({
      seedImageName: item.PictureName,
      seedImageUrl: `${import.meta.env.VITE_BACKEND_URL}${item.PictureAddress}`,
      similarity
    })
  }

  detectResult.value = result
  detectLoading.value = false
}


const pageTitlePush = inject('pageTitlePush') as (title: string, url: string) => void
const title = plantId.value ? '作物详情' : '新增作物'
pageTitlePush(title, '/plant-list')

detailGet()

onBeforeMount(async () => {

})
</script>

<template>
  <div class="plant-form">
    <h3>基本信息</h3>
    <a-form
      ref="formRef"
      name="gallery-form"
      :model="formState"
      @finish="onFinish"
    >
      <div class="action">
        <a-button v-if="isEdit" type="primary" html-type="submit">提交</a-button>
        <a-button v-else @click="toEdit">编辑</a-button>
        <a-button v-if="isEdit && plantId" @click="cancelEdit">取消</a-button>
      </div>
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item
            name="PlantName"
            label="作物名称"
            :rules="[{ required: isEdit, message: '请输入作物名称!' }]"
          >
            <a-input v-if="isEdit" v-model:value="formState.PlantName" placeholder=""></a-input>
            <div v-else>{{ formState.PlantName }}</div>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="seedId"
            label="种子名称"
            :rules="[{ required: isEdit, message: '请选择种子!' }]"
          >
            <!-- <a-input v-if="isEdit" v-model:value="formState.seedId" placeholder=""></a-input> -->
            <a-select
              v-if="isEdit"
              ref="seed-select"
              v-model:value="formState.seedId"
              style="width: 100%"
            >
              <a-select-option v-for="item in seedList" :key="item.id" :value="item.id">{{ item.PlantName }}</a-select-option>
            </a-select>
            <div v-else>{{ formState.seedName }}</div>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="greenHouseId"
            label="大棚名称"
            :rules="[{ required: isEdit, message: '请选择大棚!' }]"
          >
            <!-- <a-input v-if="isEdit" v-model:value="formState.greenHouseId" placeholder=""></a-input> -->
            <a-select
              v-if="isEdit"
              ref="seed-select"
              v-model:value="formState.greenHouseId"
              style="width: 100%"
            >
              <a-select-option v-for="item in greenHouseList" :key="item.id" :value="item.id">{{ item.greenhouseName }}</a-select-option>
            </a-select>
            <div v-else>{{ formState.greenHouseName }}</div>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="Area_m2"
            label="种植面积"
            :rules="[{ required: isEdit, message: '请输入种植面积!' }]"
          >
            <a-input v-if="isEdit" v-model:value="formState.Area_m2" placeholder=""></a-input>
            <div v-else>{{ formState.Area_m2 }}</div>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="PlantedDate"
            label="播种时间"
            :rules="[{ required: isEdit, message: '请选择播种时间!' }]"
          >
            <!-- <a-input v-if="isEdit" v-model:value="formState.PlantedDate" placeholder=""></a-input> -->
            <a-date-picker v-if="isEdit" v-model:value="formState.PlantedDate" />
            <div v-else>{{ PlantedDateText }}</div>
          </a-form-item>
        </a-col>
        <a-col :span="8" v-if="!isEdit">
          <a-form-item
            name="Days"
            label="生长天数"
          >
            <div>10天</div>
          </a-form-item>
        </a-col>
        <a-col :span="8" v-if="!isEdit">
          <a-form-item
            name="plantStatus"
            label="作物状态"
          >
            <div>幼苗期</div>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="HarvestDate"
            label="收获时间"
          >
            <!-- <a-input v-if="isEdit" v-model:value="formState.HarvestDate" placeholder=""></a-input> -->
            <a-date-picker v-if="isEdit" v-model:value="formState.HarvestDate" />
            <div v-else>{{ HarvestDateText }}</div>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="Output"
            label="作物产量"
          >
            <a-input v-if="isEdit" v-model:value="formState.Output" placeholder=""></a-input>
            <div v-else>{{ formState.Output ? `${formState.Output} KG` : '' }}</div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <a-divider></a-divider>

    <h3>生长图片</h3>
    <div class="image-action">
      <a-button type="primary" @click="addImage">新增图片</a-button>
      <a-button @click="plantImageMultiDelete">删除图片</a-button>
      <a-button @click="selectAll" >全 选</a-button>
      <a-button @click="selectNone">取消选中</a-button>
    </div>
    <a-row :gutter="24">
      <a-col :span="6" v-for="(item, index) in imageList" :key="item.id" class="gallery-image">
        <a-card hoverable>
          <template #cover>
            <div class="cover-wrapper">
              <a-checkbox
                v-model:checked="item.checked"
                @change="onImageCheck(index)"
              >
              </a-checkbox>
              <form-outlined @click="updateImage(item)"/>
              <a-image 
                :src="item.url" 
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
              />
            </div>
          </template>
          <a-card-meta title="">
            <template #description>
              <div style="margin-bottom: 16px;">
                <a-tag :color="item.PictureTypeObj.color">{{ item.PictureTypeObj.label }}</a-tag>{{ item.Description }}
              </div>
              <div><a-button @click="detect(item)" :loading="detectLoading">对比检测</a-button></div>
            </template>
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>
    <div class="detect-result" v-if="detectResult.length > 0">
      <a-table 
        :dataSource="detectResult"
        :columns="detectResultColumns"
        :pagination="false"
      >
        <template #title>
          <a-alert message="对比检测结果" type="success" show-icon />
        </template>
        <template #bodyCell="{ column, text, record, index }">
          <template v-if="column.dataIndex === 'seedImageName'">
            <a-image :src="record.seedImageUrl" :width="100"></a-image>
            <div>{{ record.seedImageName }}</div>
          </template>
          <template v-if="column.dataIndex === 'similarity'">
            <a-tag v-if="record.similarity > 50" color="blue">{{ record.similarity.toFixed(2) }}%</a-tag>
            <a-tag v-else color="red">{{ record.similarity.toFixed(2) }}%</a-tag>
          </template>
        </template>
      </a-table>
    </div>
    <a-modal v-model:visible="isEditImage" title="新增图片">
      <template #footer>
        <a-button key="back" @click="cancelAddImage">取 消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleEditImage">提 交</a-button>
      </template>
      <a-form
        ref="imageFormRef"
        name="image"
        :model="imageFormState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item
          name="Description"
          label="图片描述"
        >
          <a-textarea v-model:value="imageFormState.Description" placeholder=""></a-textarea>
        </a-form-item>
        <a-form-item
          name="PictureType"
          label="图片类型"
          :rules="[{ required: true, message: '请选择图片类型!' }]"
        >
          <a-select
            ref="image,select"
            v-model:value="imageFormState.PictureType"
            style="width: 100%"
          >
            <a-select-option v-for="item in PlantStatusArr" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          name="fileList"
          label="图片"
          :rules="[{ required: !editImageId, message: '请输入上传图片!' }]"
        >
          <a-upload :file-list="imageFormState.fileList" :before-upload="beforeUpload">
            <a-button>
              <upload-outlined></upload-outlined>
              上传图片
            </a-button>
          </a-upload>
          </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.plant-form {
  position: relative;
}
.plant-form > h3 {
  margin-bottom: 24px;
}
.cover-wrapper {
  width: 100%;
  height: 220px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cover-wrapper  > .ant-checkbox-wrapper {
  position: absolute;
  top: 0;
  left: 5px;
  z-index: 1;
}
.cover-wrapper  > .anticon-form {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 20px;
  color: #fff;
  z-index: 1;
}
.cover-wrapper  > img {
  width: 100%;
}
.action {
  position: absolute;
  top: 0;
  right: 0;
}
.action .ant-btn {
  margin-left: 8px;
}
.image-action {
  margin-bottom: 24px;
}
.image-action .ant-btn {
  margin-right: 8px;
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

.detect-result {
  width: 800px;
  border: 1px solid #eee;
  margin-top: 24px;
}
</style>


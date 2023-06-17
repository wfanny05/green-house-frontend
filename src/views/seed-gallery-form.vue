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

const router = useRouter()
const route = useRoute()

interface FormState { 
  PictureName: string
  PictureDescription: string
  [key: string]: any
}
interface ImageFormState {
  checked?: boolean
  id?: number
  PictureName: string
  PictureDescription: string
  PictureType: string
  PictureAddress?: string
  fileList: any
  [key: string]: any
}

// /static/img/16866789713804046.jpg

async function seedGet() : Promise<FormState>{
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-gallery/get',
    data: {
      id: seedGalleryId.value
    }
  })
  console.log('seedGet', res.data?.data?.data)
  return res.data?.data?.data || {}
}

async function seedUpdate() {
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
    url: '/seed-gallery/update',
    data: {
      id: seedGalleryId.value,
      item,
      ...stages
    }
  })
  await seedGet()
  isEdit.value = false
  console.log('seedUpdate', res)
}

async function seedImageAdd(): Promise<ImageFormState> {
  var formData = new FormData()
  for (var i = 0; i < imageFormState.fileList.length; i++) {
    formData.append("fileList", imageFormState.fileList[i]);
  }
  formData.append('PictureName', imageFormState.PictureName)
  formData.append('PictureDescription', imageFormState.PictureDescription)
  formData.append('PictureType', imageFormState.PictureType)
  formData.append('PictureSetID', seedGalleryId.value)
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-image/add',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
  console.log('seedImageAdd', res)
  return res.data?.data || {}
}

async function seedImageUpdate(): Promise<ImageFormState> {
  var formData = new FormData()
  for (var i = 0; i < imageFormState.fileList.length; i++) {
    formData.append("fileList", imageFormState.fileList[i]);
  }
  formData.append('id', editImageId+'')
  formData.append('PictureName', imageFormState.PictureName)
  formData.append('PictureDescription', imageFormState.PictureDescription)
  formData.append('PictureType', imageFormState.PictureType)
  formData.append('PictureSetID', seedGalleryId.value)
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-image/update',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
  console.log('seedImageUpdate', res)
  return res.data?.data || {}
}

async function seedImageMultiDelete() {
  const ids = imageList.value.filter(item => item.checked).map(item => item.id).join(',')
  const imagePaths = imageList.value.filter(item => item.checked).map(item => item.PictureAddress)
  if(!ids) {
    message.error('请选择要删除的图片');
    return
  }
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-image/multi-del',
    data: {
      ids,
      imagePaths
    }
  })
  console.log('seedImageMultiDelete', res)
  // if (dataSource.value.length === tableState.selectedRowKeys.length && pagination.current > 1) {
  //   console.log(1234, pagination.current)
  //   pagination.current--
  // } 
  await detailGet()
}

async function seedImageQuery(PictureSetID: number): Promise<ImageFormState[]> {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-image/page',
    data: {
      PictureSetID,
      pageSize: 100,
    }
  })
  console.log('seedImageQuery', res.data?.data)
  return res.data?.data?.list || {}
}

const detailGet = async () => {
  if(seedGalleryId.value) {
    const res = await seedGet()
    Object.keys(formState).forEach((key: string) => {
      // console.log('key', key, res[key])
      formState[key] = res[key]
    })
    const list = await seedImageQuery(res.id)
    imageList.value = list.map(item => ({
      ...item,
      url: `${import.meta.env.VITE_BACKEND_URL}${item.PictureAddress}`,
      checked: false,
    }))
  }
}

let seedGalleryId = ref<string>(route.query.id as string)
let isEdit = ref(false)
const toEdit = () => {
  isEdit.value = true
}
const cancelEdit = () => {
  isEdit.value = false
}
const formRef = ref<FormInstance>();
const formState = reactive<FormState>({
  PictureName: '',
  PictureDescription: '',
});
const onFinish = async (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  await seedUpdate()
  message.success('更新成功！');
};

const goBack = () => {
  router.push({
    path: '/seed-gallery',
  })
}

const imageFormRef = ref<FormInstance>();
const imageFormState = reactive<ImageFormState>({
  PictureName: '',
  PictureDescription: '',
  PictureType: '',
  fileList: [],
});
let isEditImage = ref(false)
let editImageId: number | undefined
const addImage = () => {
  isEditImage.value = true
  editImageId = undefined
  imageFormState.PictureName = ''
  imageFormState.PictureDescription = ''
}
const cancelAddImage = () => {
  isEditImage.value = false
}
const loading = ref<boolean>(false);
const handleEditImage = async () => {
  const form = imageFormRef.value as FormInstance;
  form.validate().then(async () => {
    const res =  editImageId ? (await seedImageUpdate()): (await seedImageAdd())
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
  imageFormState.PictureDescription = item.PictureDescription
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

const pageTitlePush = inject('pageTitlePush') as (title: string, url: string) => void
const title = '图集详情'
pageTitlePush(title, '/seed-gallery')

detailGet()

onBeforeMount(async () => {

})
</script>

<template>
  <div class="seed-gallery-form">
    <a-form
      ref="formRef"
      name="gallery-form"
      :model="formState"
      @finish="onFinish"
    >
      <div class="action">
        <a-button v-if="isEdit" type="primary" html-type="submit">提交</a-button>
        <a-button v-else @click="toEdit">编辑</a-button>
        <a-button v-if="isEdit && seedGalleryId" @click="cancelEdit">取消</a-button>
      </div>
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item
            name="PictureName"
            label="图集名称"
            :rules="[{ required: isEdit, message: '请输入图集名称!' }]"
          >
            <a-input v-if="isEdit" v-model:value="formState.PictureName" placeholder=""></a-input>
            <div v-else>{{ formState.PictureName }}</div>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item
            name="PictureDescription"
            label="图集描述"
          >
            <a-input v-if="isEdit" v-model:value="formState.PictureDescription" placeholder=""></a-input>
            <div v-else>{{ formState.PictureDescription }}</div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <a-divider></a-divider>

    <div class="image-action">
      <a-button type="primary" @click="addImage">新增图片</a-button>
      <a-button @click="seedImageMultiDelete">删除图片</a-button>
      <a-button @click="selectAll" >全 选</a-button>
      <a-button @click="selectNone">取消选中</a-button>
    </div>
    <a-row :gutter="24">
      <a-col :span="4" v-for="(item, index) in imageList" :key="item.id" class="gallery-image">
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
                fallback="data:image/png;base64,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"
              />
            </div>
          </template>
          <a-card-meta :title="item.PictureName">
            <template #description>{{ item.PictureDescription }}</template>
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>

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
          name="PictureName"
          label="图片名称"
          :rules="[{ required: true, message: '请输入图片名称!' }]"
        >
          <a-input v-model:value="imageFormState.PictureName" placeholder=""></a-input>
        </a-form-item>
        <a-form-item
          name="PictureDescription"
          label="图片描述"
        >
          <a-input v-model:value="imageFormState.PictureDescription" placeholder=""></a-input>
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
.seed-gallery-form {
  position: relative;
}
.cover-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  position: relative;
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
</style>


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

const BackendUrl = 'http://localhost:6166'

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

// http://localhost:6166/static/img/16866789713804046.jpg

async function seedGet() : Promise<FormState>{
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed-gallery/get',
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
    url: 'http://localhost:6166/seed-gallery/update',
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
    url: 'http://localhost:6166/seed-image/add',
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
    url: 'http://localhost:6166/seed-image/update',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData,
  })
  console.log('seedImageUpdate', res)
  return res.data?.data || {}
}

async function seedImageMultiDelete() {
  const ids = imageList.value.filter(item => item.checked).map(item => item.id).join(',')
  if(!ids) {
    message.error('请选择要删除的图片');
    return
  }
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed-image/multi-del',
    data: {
      ids
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
    url: 'http://localhost:6166/seed-image/page',
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
              <img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
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
}
.cover-wrapper  > .anticon-form {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 20px;
  color: #fff;
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


<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { FormInstance } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  PlusOutlined
} from '@ant-design/icons-vue';

interface DataSourceItem {
  id: number;
  PictureName: string;
  PictureDescription: string;
  cover?: string;
}
interface FormState {
  PictureName: string;
  PictureDescription: string;
}

const router = useRouter()

async function seedGalleryAdd() {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-gallery/add',
    data: {
      item: {
        ...formState
      }
    }
  })
  console.log('seedGalleryAdd', res)
  await seedGalleryQuery()
}

async function seedGalleryDelete(id: number, index: number) {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-gallery/del',
    data: {
      id
    }
  })
  console.log('seedGalleryDelete', res)
  dataSource.value.splice(index, 1)
}

const seedGalleryQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-gallery/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }
  })
  console.log('seedGalleryQuery', res.data)
  pagination.total = res.data.data.total
  let list = res.data.data.list
  await new Promise((resolve) => {
     list.forEach(async (item: any, index: number) => {
      const coverPicture = await getCoverPicture(item.id)
      item.cover = coverPicture.url
       if (index === list.length - 1) {
         resolve('')
       }
    })
  })
  dataSource.value = list
  return res.data
}

async function getCoverPicture<T extends { url?: string, PictureAddress?: string }>(PictureSetID: number): Promise<T> {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed-image/page',
    data: {
      PictureSetID,
      pageSize: 1,
    }
  })
  console.log('getCoverPicture', res.data?.data)
  const coverPicture: T = res.data?.data?.list?.[0] || {}
  coverPicture.url = coverPicture.PictureAddress ? `${import.meta.env.VITE_BACKEND_URL}${coverPicture.PictureAddress}` : ''
  return coverPicture
}

let dataSource = ref<DataSourceItem[]>([])
const pagination: {
  current: number;
  pageSize: number;
  total: number;
} = reactive({
  current: 1,
  pageSize: 100,
  total: 0,
})

await seedGalleryQuery() 

const toFormPage = (id: number | undefined) => {
  router.push({
    path: '/seed-gallery-form',
    query: {
      id,
    }
  })
}

const formRef = ref<FormInstance>();
const formState = reactive<FormState>({
  PictureName: '',
  PictureDescription: '',
});
let isAdd = ref(false)
const add = () => {
  isAdd.value = true
}
const cancelAdd = () => {
  isAdd.value = false
}
const loading = ref<boolean>(false);
const handleAdd = () => {
  const form = formRef.value as FormInstance;
  form.validate().then(() => {
    console.log('formState', formState)
    seedGalleryAdd()
    cancelAdd()
  }).catch(err => {
    console.log('error', err);
  });
}

onBeforeMount(async () => {

})
</script>

<template>
  <div>
    <!--<a-button @click="dataFill(2, 'seedGallery')">Add</a-button>-->
    <a-row :gutter="24">
      <a-col :span="6">
        <div class="add-button" @click="add">
          <plus-outlined /><span>新增图集</span>
        </div>
      </a-col>
      <a-col :span="6" v-for="(item, index) in dataSource" :key="item.id" class="gallery">
        <a-card hoverable>
          <template #cover>
            <div class="cover-wrapper">
              <a-image 
                width="100%" 
                :src="item.cover" 
                fallback="data:image/png;base64,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"
              />
            </div>
          </template>
          <a-card-meta :title="item.PictureName">
            <template #description>{{ item.PictureDescription }}---{{ item.cover }}</template>
          </a-card-meta>
          <template #actions>
            <div class="action-btn" @click="toFormPage(item.id)">查看图集</div>
            <div class="action-btn" @click="seedGalleryDelete(item.id, index)">删除图集</div>
            <!-- <div class="action-btn">查看图片</div> -->
          </template>
        </a-card>
      </a-col>
    </a-row>
    <a-modal v-model:visible="isAdd" title="新增图集" @ok="handleAdd" @cancel="cancelAdd">
      <a-form
        ref="formRef"
        name="gallery"
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item
          name="PictureName"
          label="图集名称"
          :rules="[{ required: true, message: '请输入图集名称!' }]"
        >
          <a-input v-model:value="formState.PictureName" placeholder=""></a-input>
        </a-form-item>
        <a-form-item
          name="PictureDescription"
          label="图集描述"
        >
          <a-textarea v-model:value="formState.PictureDescription" placeholder=""></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.add-button {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d9d9d9;
  font-size: 16px;
  color: #666;
  cursor: pointer;
}
.gallery {
  margin-bottom: 24px;
}
.cover-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  display: flex;
  align-items: center;
}
.cover-wrapper  > img{
  width: 100%;
}
.action-btn {
}
</style>

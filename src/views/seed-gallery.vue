<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { PaginationProps, FormInstance } from 'ant-design-vue'
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
    url: 'http://localhost:6166/seed-gallery/add',
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
    url: 'http://localhost:6166/seed-gallery/del',
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
    url: 'http://localhost:6166/seed-gallery/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    }
  })
  console.log('seedGalleryQuery', res.data)
  pagination.total = res.data.data.total
  dataSource.value = res.data.data.list
  return res.data
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
    <a-button @click="dataFill(2, 'seedGallery')">Add</a-button>
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
              <img alt="example" src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png" />
            </div>
          </template>
          <a-card-meta :title="item.PictureName">
            <template #description>{{ item.PictureDescription }}</template>
          </a-card-meta>
          <template #actions>
            <div class="action-btn" @click="toFormPage(item.id)">查看图集</div>
            <div class="action-btn" @click="seedGalleryDelete(item.id, index)">删除图集</div>
            <div class="action-btn">查看图片</div>
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
}
.cover-wrapper  > img{
  width: 100%;
}
.action-btn {
}
</style>

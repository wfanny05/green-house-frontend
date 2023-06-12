<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { PaginationProps, FormInstance } from 'ant-design-vue'
import { useRouter } from 'vue-router'


interface DataSourceItem {
  key: number;
  id: number;
  seedGalleryCode: string;
  greenhouseName: string;
  PersonName: string;
  PersonTel: string;
}

const router = useRouter()

async function seedGalleryDelete(id: number, index: number) {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed-gallery/del',
    data: {
      id
    }
  })
  console.log('seedGalleryDelete', res)
  if (dataSource.value.length === 1 && pagination.current > 1) {
    console.log(123, pagination.current)
    pagination.current--
    await seedGalleryQuery()
  } else if (dataSource.value.length < pagination.pageSize) {
    dataSource.value.splice(index, 1)
  } else {
    await seedGalleryQuery()
  }
}

async function seedGalleryMultiDelete() {
  const ids = tableState.selectedRowKeys.join(',')
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/seed-gallery/multi-del',
    data: {
      ids
    }
  })
  console.log('seedGalleryMultiDelete', res)
   if (dataSource.value.length === tableState.selectedRowKeys.length && pagination.current > 1) {
    console.log(1234, pagination.current)
    pagination.current--
  } 
  await seedGalleryQuery()
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
  dataSource.value = (res.data.data.list as DataSourceItem[]).map(item => {
    item.key = item.id
    return item
  })
  return res.data
}

// const formRef = ref<FormInstance>();
// const formState = reactive({
//   seedGalleryCode: '',
//   greenhouseName: ''
// });
// const onFinish = (values: any) => {
//   console.log('Received values of form: ', values);
//   console.log('formState: ', formState);
//   pagination.current = 1
//   seedGalleryQuery()
// };
// const onReset = () => {
//   (formRef.value as FormInstance).resetFields()
//   pagination.current = 1
//   seedGalleryQuery()
// }

let dataSource = ref<DataSourceItem[]>([])
const pagination: {
  current: number;
  pageSize: number;
  total: number;
} = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
})

await seedGalleryQuery() 

const toFormPage = (id: number | undefined) => {
  console.log('toFormPage')
  router.push({
    path: '/seed-gallery-form',
    query: {
      id,
    }
  })
}

onBeforeMount(async () => {

})
</script>

<template>
  <div>
    <a-button @click="dataFill(2, 'seedGallery')">Add</a-button>
    <a-row :gutter="24">
      <a-col :span="8">
        <div class="add-button">
          新增图集
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>

</style>

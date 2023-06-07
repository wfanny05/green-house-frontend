<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { PaginationProps } from 'ant-design-vue'

async function greenHouseAdd(item) {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/add',
    data: {
      item: {
        greenHouseCode: 'gh_001',
        greenhouseName: '大棚01',
        PersonName: '张三',
        PersonTel: '13888888888',
      }
    }
  })
  console.log('greenHouseAdd', res)
}

async function greenHouseUpdate() {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/update',
    data: {
      id: 2,
      item: {
        Category: '蔬菜类',
        PlantName: '番茄22222277',
        Stage: '2', // 1 萌发期；2 幼苗期；3 生长期；4 开花期；5 结果期
      }
    }
  })
  console.log('greenHouseUpdate', res)
}

async function greenHouseDelete() {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/del',
    data: {
      id: 1
    }
  })
  console.log('greenHouseDelete' ,res)
}


let dataSource = ref([])
const columns = [
  {
    title: '大棚编号',
    dataIndex: 'greenHouseCode',
    key: 'greenHouseCode',
  },
  {
    title: '大棚名称',
    dataIndex: 'greenHouseCode',
    key: 'greenHouseCode',
  },
  {
    title: '大棚地址',
    dataIndex: 'Region',
    key: 'Region',
  },
  {
    title: '负责人',
    dataIndex: 'PersonName',
    key: 'PersonName',
  },
  {
    title: '负责人手机',
    dataIndex: 'PersonTel',
    key: 'PersonTel',
  },
  {
    title: '​所属机构',
    dataIndex: 'Institution',
    key: 'Institution',
  },
  {
    title: '操作',
    key: 'action',
  },
]
let pagination: PaginationProps = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  // showSizeChanger: true,
  showQuickJumper: true,
  // showTotal: (total: number) => `共 ${total} 条`,
})

const greenHouseQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    }
  })
  console.log('greenHouseQuery', res)
  pagination.total = res.data.total
  dataSource.value = res.data.list
  return res.data
}

await greenHouseQuery() 

// watch(() => pagination, () => {
//   console.log('current', pagination.current);
// }, { deep: true });

const tableChange = async (_pagination: PaginationProps) => {
  console.log('tableChange', _pagination);
  pagination.current = _pagination.current
  await greenHouseQuery()
}

const alertMsg = computed(() => `大棚数量：${pagination.total}`)

onBeforeMount(async () => {

})
</script>

<template>
  <div>
    <a-button @click="dataFill(3, 'greenHouse')">Add</a-button>
    <a-button @click="greenHouseDelete">Delete</a-button>
    <a-button @click="greenHouseUpdate">Update</a-button>
    <a-button @click="greenHouseQuery">Query</a-button>

    <a-alert :message="alertMsg" type="info" show-icon />

    <a-table :dataSource="dataSource" :columns="columns" :pagination="pagination" @change="tableChange"/>
  </div>

</template>


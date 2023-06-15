<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { PaginationProps, FormInstance } from 'ant-design-vue'
import { useRouter } from 'vue-router'


interface DataSourceItem {
  key: number
  id: number
  PlantName: string
  Category: string
  Supplier: string
  SupplierTel: string
}

const router = useRouter()

async function seedDelete(id: number, index: number) {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed/del',
    data: {
      id
    }
  })
  console.log('seedDelete', res)
  if (dataSource.value.length === 1 && pagination.current > 1) {
    console.log(123, pagination.current)
    pagination.current--
    await seedQuery()
  } else if (dataSource.value.length < pagination.pageSize) {
    dataSource.value.splice(index, 1)
  } else {
    await seedQuery()
  }
}

async function seedMultiDelete() {
  const ids = tableState.selectedRowKeys.join(',')
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: '/seed/multi-del',
    data: {
      ids
    }
  })
  console.log('seedMultiDelete', res)
   if (dataSource.value.length === tableState.selectedRowKeys.length && pagination.current > 1) {
    console.log(1234, pagination.current)
    pagination.current--
  } 
  await seedQuery()
}

const seedQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/seed/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...formState
    }
  })
  console.log('seedQuery', res.data)
  pagination.total = res.data.data.total
  dataSource.value = (res.data.data.list as DataSourceItem[]).map(item => {
    item.key = item.id
    return item
  })
  return res.data
}


const formRef = ref<FormInstance>();
const formState = reactive({
  PlantName: '',
  Supplier: ''
});
const onFinish = (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  pagination.current = 1
  seedQuery()
};
const onReset = () => {
  (formRef.value as FormInstance).resetFields()
  pagination.current = 1
  seedQuery()
}

let dataSource = ref<DataSourceItem[]>([])
const columns = [
  {
    title: '种子名称',
    dataIndex: 'PlantName',
    key: 'PlantName',
  },
  {
    title: '品种',
    dataIndex: 'Category',
    key: 'Category',
  },
  {
    title: '供应商',
    dataIndex: 'Supplier',
    key: 'Supplier',
  },
  {
    title: '供应商电话',
    dataIndex: 'SupplierTel',
    key: 'SupplierTel',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
  },
]
const pagination: {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number) => string;
} = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  // showSizeChanger: true,
  showQuickJumper: true,
  // showTotal: (total: number) => `共 ${total} 条`,
})
const tableState = reactive<{
  selectedRowKeys: number[];
  loading: boolean;
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
});

await seedQuery() 

const onSelectChange = (selectedRowKeys: number[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  tableState.selectedRowKeys = selectedRowKeys;
};

const tableChange = async (_pagination: PaginationProps) => {
  console.log('tableChange', _pagination);
  pagination.current = _pagination.current as number
  await seedQuery()
}

const alertMsg = computed(() => `种子数量：${pagination.total}`)

const toFormPage = (id: number | undefined, isEdit: Boolean = false) => {
  console.log('toFormPage')
  router.push({
    path: '/seed-list-form',
    query: {
      id,
      edit: isEdit ? 1 : 0
    }
  })
}

onBeforeMount(async () => {

})
</script>

<template>
  <div>
    <a-form
      ref="formRef"
      name="advanced_search"
      class="ant-advanced-search-form"
      :model="formState"
      @finish="onFinish"
    >
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item
            name="PlantName"
            label="种子名称"
          >
            <a-input v-model:value="formState.PlantName" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="Supplier"
            label="供应商"
          >
            <a-input v-model:value="formState.Supplier" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button style="margin: 0 8px" @click="onReset">重置</a-button>
        </a-col>
      </a-row>
    </a-form>

    <div>
      <a-button type="primary" @click="toFormPage(undefined)">新增</a-button>
      <a-button @click="seedMultiDelete">批量删除</a-button>
    </div>

    <a-alert :message="alertMsg" type="info" show-icon />

    <!--<a-button @click="dataFill(3, 'seed')">Add</a-button>-->

    <a-table 
      :row-selection="{ selectedRowKeys: tableState.selectedRowKeys, onChange: onSelectChange }"
      :dataSource="dataSource" 
      :columns="columns"
      :pagination="pagination" 
      @change="tableChange" 
    >
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'operation'">
          <a @click.prevent="toFormPage(record.id)">查看详情</a>
          <a-divider type="vertical" />
          <!-- <a @click.prevent="toFormPage(record.id, true)">编辑</a> -->
        </template>
      </template>
  </a-table>
  </div>

</template>


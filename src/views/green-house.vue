<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { PaginationProps, FormInstance } from 'ant-design-vue'


interface DataSourceItem {
  key: number;
  id: number;
  greenHouseCode: string;
  greenhouseName: string;
  PersonName: string;
  PersonTel: string;
}

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

async function greenHouseDelete(id: number, index: number) {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/del',
    data: {
      id
    }
  })
  console.log('greenHouseDelete', res)
  if (dataSource.value.length === 1 && pagination.current > 1) {
    console.log(123, pagination.current)
    pagination.current--
    await greenHouseQuery()
  } else if (dataSource.value.length < pagination.pageSize) {
    dataSource.value.splice(index, 1)
  } else {
    await greenHouseQuery()
  }
}

async function greenHouseMultiDelete() {
  const ids = tableState.selectedRowKeys.join(',')
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/multi-del',
    data: {
      ids
    }
  })
  console.log('greenHouseMultiDelete', res)
   if (dataSource.value.length === tableState.selectedRowKeys.length && pagination.current > 1) {
    console.log(1234, pagination.current)
    pagination.current--
  } 
  await greenHouseQuery()
}

const greenHouseQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/green-house/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...formState
    }
  })
  console.log('greenHouseQuery', res.data)
  pagination.total = res.data.data.total
  dataSource.value = (res.data.data.list as DataSourceItem[]).map(item => {
    item.key = item.id
    return item
  })
  return res.data
}


const formRef = ref<FormInstance>();
const formState = reactive({
  greenHouseCode: '',
  greenhouseName: ''
});
const onFinish = (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  pagination.current = 1
  greenHouseQuery()
};
const onReset = () => {
  (formRef.value as FormInstance).resetFields()
  pagination.current = 1
  greenHouseQuery()
}

let dataSource = ref<DataSourceItem[]>([])
const columns = [
  {
    title: '大棚编号',
    dataIndex: 'greenHouseCode',
    key: 'greenHouseCode',
  },
  {
    title: '大棚名称',
    dataIndex: 'greenhouseName',
    key: 'greenhouseName',
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

await greenHouseQuery() 

// watch(() => pagination, () => {
//   console.log('current', pagination.current);
// }, { deep: true });

const onSelectChange = (selectedRowKeys: number[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  tableState.selectedRowKeys = selectedRowKeys;
};

const tableChange = async (_pagination: PaginationProps) => {
  console.log('tableChange', _pagination);
  pagination.current = _pagination.current as number
  await greenHouseQuery()
}

const alertMsg = computed(() => `大棚数量：${pagination.total}`)

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
            name="greenHouseCode"
            label="大棚编号"
          >
            <a-input v-model:value="formState.greenHouseCode" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="greenhouseName"
            label="大棚名称"
          >
            <a-input v-model:value="formState.greenhouseName" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button style="margin: 0 8px" @click="onReset">重置</a-button>
        </a-col>
      </a-row>
    </a-form>

    <div>
      <a-button type="primary">新增</a-button>
      <a-button @click="greenHouseMultiDelete">批量删除</a-button>
    </div>

    <a-alert :message="alertMsg" type="info" show-icon />

    <a-button @click="dataFill(3, 'greenHouse')">Add</a-button>
    <!-- <a-button @click="greenHouseDelete">Delete</a-button>
    <a-button @click="greenHouseUpdate">Update</a-button>
    <a-button @click="greenHouseQuery">Query</a-button> -->

    <a-table 
      :row-selection="{ selectedRowKeys: tableState.selectedRowKeys, onChange: onSelectChange }"
      :dataSource="dataSource" 
      :columns="columns"
      :pagination="pagination" 
      @change="tableChange" 
    >
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'operation'">
          <a @click.prevent="greenHouseMultiDelete">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            v-if="dataSource.length"
            title="Sure to delete?"
            @confirm="greenHouseDelete(record.id, index)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </template>
  </a-table>
  </div>

</template>


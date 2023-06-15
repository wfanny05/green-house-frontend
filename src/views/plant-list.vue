<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import type { PaginationProps, FormInstance } from 'ant-design-vue'
import { useRouter } from 'vue-router'

interface DataSourceItem {
  key: number;
  id: number;
  PlantName: string;
  seedName: string;
  greenHouseName: string;
  PlantedDate: string;
  Days: number;
  PlantStatus: string;
  PlantStatusName: string;
  HarvestDate: string
  isHarvest: boolean;
}

const router = useRouter()

async function plantDelete(id: number, index: number) {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/plant/del',
    data: {
      id
    }
  })
  console.log('plantDelete', res)
  if (dataSource.value.length === 1 && pagination.current > 1) {
    console.log(123, pagination.current)
    pagination.current--
    await plantQuery()
  } else if (dataSource.value.length < pagination.pageSize) {
    dataSource.value.splice(index, 1)
  } else {
    await plantQuery()
  }
}

async function plantMultiDelete() {
  const ids = tableState.selectedRowKeys.join(',')
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/plant/multi-del',
    data: {
      ids
    }
  })
  console.log('plantMultiDelete', res)
   if (dataSource.value.length === tableState.selectedRowKeys.length && pagination.current > 1) {
    console.log(1234, pagination.current)
    pagination.current--
  } 
  await plantQuery()
}

const plantQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/plant/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...formState
    }
  })
  console.log('plantQuery', res.data)
  pagination.total = res.data.data.total
  dataSource.value = (res.data.data.list as DataSourceItem[]).map(item => {
    item.key = item.id
    const i = Number(item.PlantStatus) - 1
    item.PlantStatusName = PlantStatusArr[i].label
    item.isHarvest = !item.HarvestDate
    return item
  })
  return res.data
}

const PlantStatusArr = [{
  label: '萌发期',
  value: 1
}, {
  label: '幼苗期',
  value: 2
}, {
  label: '生长期',
  value: 3
}, {
  label: '开花期',
  value: 4
}, {
  label: '结果期',
  value: 5
}]

const formRef = ref<FormInstance>();
const formState = reactive({
  PlantName: '',
  seedName: '',
  greenHouseName: '',

});
const onFinish = (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  pagination.current = 1
  plantQuery()
};
const onReset = () => {
  (formRef.value as FormInstance).resetFields()
  pagination.current = 1
  plantQuery()
}

let dataSource = ref<DataSourceItem[]>([])
const columns = [
  {
    title: '作物名称',
    dataIndex: 'PlantName',
    key: 'PlantName',
  },
  {
    title: '种子名称',
    dataIndex: 'seedName',
    key: 'seedName',
  },
  {
    title: '大棚名称',
    dataIndex: 'greenHouseName',
    key: 'greenHouseName',
  },
  {
    title: '播种时间',
    dataIndex: 'PlantedDate',
    key: 'PlantedDate',
  },
  {
    title: '生长天数',
    dataIndex: 'Days',
    key: 'Days',
  },
  {
    title: '作物状态',
    dataIndex: 'PlantStatusName',
    key: 'PlantStatusName',
  },
  {
    title: '收获完成',
    dataIndex: 'isHarvest',
    key: 'isHarvest',
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

await plantQuery() 

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
  await plantQuery()
}

const toFormPage = (id: number | undefined) => {
  console.log('toFormPage')
  router.push({
    path: '/plant-list-form',
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
    <a-form
      ref="formRef"
      name="advanced_search"
      :model="formState"
      @finish="onFinish"
    >
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item
            name="plantCode"
            label="作物名称"
          >
            <a-input v-model:value="formState.PlantName" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="seedName"
            label="种子名称"
          >
            <a-input v-model:value="formState.seedName" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8"></a-col>
        <a-col :span="8">
          <a-form-item
            name="greenHouseName"
            label="大棚名称"
          >
            <a-input v-model:value="formState.greenHouseName" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <!-- <a-col :span="8">
          <a-form-item
            name="PlantedDate"
            label="播种时间"
          >
            <a-input v-model:value="formState.PlantedDate" placeholder=""></a-input>
          </a-form-item>
        </a-col> -->
        <!-- <a-col :span="8">
          <a-form-item
            name="PlantStatus"
            label="作物状态"
          >
            <a-input v-model:value="formState.PlantStatus" placeholder=""></a-input>
          </a-form-item>
        </a-col> -->
        <a-col :span="8">
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button style="margin: 0 8px" @click="onReset">重置</a-button>
        </a-col>
      </a-row>
    </a-form>

    <div>
      <a-button type="primary" @click="toFormPage(undefined)">新增</a-button>
      <a-button @click="plantMultiDelete">批量删除</a-button>
    </div>

    <a-button @click="dataFill(3, 'plant')">Add</a-button>

    <a-table 
      :row-selection="{ selectedRowKeys: tableState.selectedRowKeys, onChange: onSelectChange }"
      :dataSource="dataSource" 
      :columns="columns"
      :pagination="pagination" 
      @change="tableChange" 
    >
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'isHarvest'">
        {{ record.isHarvest ? '是' : '否'  }}
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <a @click.prevent="toFormPage(record.id)">查看详情</a>
        </template>
      </template>
  </a-table>
  </div>

</template>


<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import { useRouter } from 'vue-router'
import type { PaginationProps, FormInstance } from 'ant-design-vue'
import type { Dayjs } from 'dayjs';
type RangeValue = [Dayjs, Dayjs];

interface DataSourceItem {
  GreenhouseCode: number
  RecordDate: string
  AirTemp: number
  AirHumidity: number;
  SoilTemp: number;
  SoilHumidity: number;
  CarbonDioxideLevel: number;
  Illuminance: number;
}

const router = useRouter()

const envInfoQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: 'http://localhost:6166/env-info/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...formState,
      RecordDate: [...formState.RecordDate]
    }
  })
  console.log('envInfoQuery', formState.RecordDate[0] && formState.RecordDate[0].format('YYYY-MM-DD HH:mm:ss'), res.data)
  pagination.total = res.data.data.total
  dataSource.value = (res.data.data.list as DataSourceItem[])
  // .map(item => {
  //   item.key = item.id
  //   return item
  // })
  return res.data
}


const formRef = ref<FormInstance>();
const formState = reactive({
  greenHouseCode: '',
  greenhouseName: '',
  RecordDate: []
});
const onFinish = (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  pagination.current = 1
  envInfoQuery()
};
const onReset = () => {
  (formRef.value as FormInstance).resetFields()
  pagination.current = 1
  envInfoQuery()
}

let dataSource = ref<DataSourceItem[]>([])
const columns = [
  {
    title: '大棚编号',
    dataIndex: 'GreenhouseCode',
    key: 'GreenhouseCode',
  },
  {
    title: '大棚名称',
    dataIndex: 'GreenhouseName',
    key: 'GreenhouseName',
  },
  {
    title: '记录时间',
    dataIndex: 'RecordDate',
    key: 'RecordDate',
  },
  {
    title: '​空气温度(​°C)',
    dataIndex: 'AirTemp',
    key: 'AirTemp',
  },
  {
    title: '​空气湿度(%)',
    dataIndex: 'AirHumidity',
    key: 'AirHumidity',
  },
  {
    title: '​​​土壤温度(​°C)',
    dataIndex: 'SoilTemp',
    key: 'SoilTemp',
  },
  {
    title: '​​土壤湿度(%)',
    dataIndex: 'SoilHumidity',
    key: 'SoilHumidity',
  },
  {
    title: '​​二氧化碳浓度(ppm)',
    dataIndex: 'CarbonDioxideLevel',
    key: 'CarbonDioxideLevel',
  },
  {
    title: '​光照度(lux)',
    dataIndex: 'Illuminance',
    key: 'Illuminance',
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

await envInfoQuery() 

const onSelectChange = (selectedRowKeys: number[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  tableState.selectedRowKeys = selectedRowKeys;
};

const tableChange = async (_pagination: PaginationProps) => {
  console.log('tableChange', _pagination);
  pagination.current = _pagination.current as number
  await envInfoQuery()
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
      </a-row>
      <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item
              name="RecordDate"
              label="记录时间"
            >
              <a-range-picker v-model:value="formState.RecordDate" show-time />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-button type="primary" html-type="submit">搜索</a-button>
            <a-button style="margin: 0 8px" @click="onReset">重置</a-button>
          </a-col>
        </a-row>
    </a-form>

    <a-button @click="dataFill(1, 'envInfo')">Add</a-button>

    <!-- :row-selection="{ selectedRowKeys: tableState.selectedRowKeys, onChange: onSelectChange }" -->
    <a-table 
      :dataSource="dataSource" 
      :columns="columns"
      :pagination="pagination" 
      @change="tableChange" 
    >
    </a-table>
  </div>
</template>


<script setup lang="ts">
import { reactive, onBeforeMount, watch, ref, toRefs, computed } from 'vue'
import axiosInstance from '../utils/axios-instance'
import { dataFill } from '../utils/mock'
import { type PaginationProps, type FormInstance, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'


interface DataSourceItem {
  key: number;
  id: number;
  SensorCode: string;
  SensorName: string;
  greenHouseCode: string;
  SensorType: string;
  SensorTypeName: string;
  Volume: number;
  FloorVolume: number;
  CeilingVolume: number
}
interface FormState {
  SensorCode: string;
  SensorName: string;
}
interface SensorFormState {
  SensorCode: string
  SensorName: string
  greenHouseCode: number // 大棚id
  SensorType: string // 1 光照度传感器；2 二氧化碳传感器；3 空气温度传感器； 4 土壤温度传感器；5 空气湿度传感器；6 土壤湿度传感器
  Volume: number // 测量值
  FloorVolume: number // 上限值
  CeilingVolume: number // 下限值
  Note: string // 备注
  [key: string]: any
}

const router = useRouter()

async function sensorGet(): Promise<FormState> {
  const res = await axiosInstance({
    method: 'post',
    url: '/sensor/get',
    data: {
      id: editSensorId
    }
  })
  console.log('sensorGet', res)
  return res.data?.data?.data || {}
}

async function sensorAdd() {
  const res = await axiosInstance({
    method: 'post',
    url: '/sensor/add',
    data: {
      item: {
        ...sensorFormState
      }
    }
  })
  console.log('sensorAdd', res)
}

async function sensorUpdate() {
  const res = await axiosInstance({
    method: 'post',
    url: '/sensor/update',
    data: {
      id: editSensorId,
      item: {
        ...sensorFormState
      }
    }
  })
  console.log('sensorUpdate', res)
}

async function sensorDelete(id: number, index: number) {
  const res = await axiosInstance({
    method: 'post',
    url: '/sensor/del',
    data: {
      id
    }
  })
  console.log('sensorDelete', res)
  if (dataSource.value.length === 1 && pagination.current > 1) {
    // console.log(123, pagination.current)
    pagination.current--
    await sensorQuery()
  } else if (dataSource.value.length < pagination.pageSize) {
    dataSource.value.splice(index, 1)
  } else {
    await sensorQuery()
  }
}

async function sensorMultiDelete() {
  const ids = tableState.selectedRowKeys.join(',')
  // console.log(111, ids)
  const res = await axiosInstance({
    method: 'post',
    url: '/sensor/multi-del',
    data: {
      ids
    }
  })
  console.log('sensorMultiDelete', res)
   if (dataSource.value.length === tableState.selectedRowKeys.length && pagination.current > 1) {
    console.log(1234, pagination.current)
    pagination.current--
  } 
  await sensorQuery()
}

const SensorTypeList = [
  {
    label: '光照度传感器',
    value: '1'
  },
  {
    label: '二氧化碳传感器',
    value: '2'
  },
  {
    label: '空气温度传感器',
    value: '3'
  },
  {
    label: '土壤温度传感器',
    value: '4'
  },
  {
    label: '空气湿度传感器',
    value: '5'
  },
  {
    label: '土壤湿度传感器',
    value: '6'
  }
]

const sensorQuery = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/sensor/page',
    data: {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...formState
    }
  })
  console.log('sensorQuery', res.data)
  pagination.total = res.data.data.total
  dataSource.value = (res.data.data.list as DataSourceItem[]).map(item => {
    item.key = item.id
    item.SensorTypeName = SensorTypeList.find(type => type.value === item.SensorType)?.label as string
    return item
  })
  return res.data
}

const formRef = ref<FormInstance>();
const formState = reactive<FormState>({
  SensorCode: '',
  SensorName: ''
});
const onFinish = (values: any) => {
  console.log('Received values of form: ', values);
  console.log('formState: ', formState);
  pagination.current = 1
  sensorQuery()
};
const onReset = () => {
  (formRef.value as FormInstance).resetFields()
  pagination.current = 1
  sensorQuery()
}

let dataSource = ref<DataSourceItem[]>([])
const columns = [
  {
    title: '传感器编号',
    dataIndex: 'SensorCode',
    key: 'SensorCode',
  },
  {
    title: '传感器名称',
    dataIndex: 'SensorName',
    key: 'SensorName',
  },
  {
    title: '大棚名称',
    dataIndex: 'greenhouseName',
    key: 'greenhouseName',
  },
  {
    title: '传感器种类',
    dataIndex: 'SensorTypeName',
    key: 'SensorTypeName',
  },
  {
    title: '测量值',
    dataIndex: 'Volume',
    key: 'Volume',
  },
  {
    title: '上限值',
    dataIndex: 'FloorVolume',
    key: 'FloorVolume',
  },
  {
    title: '下限值',
    dataIndex: 'CeilingVolume',
    key: 'CeilingVolume',
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

await sensorQuery() 

const onSelectChange = (selectedRowKeys: number[]) => {
  console.log('selectedRowKeys changed: ', selectedRowKeys);
  tableState.selectedRowKeys = selectedRowKeys;
};

const tableChange = async (_pagination: PaginationProps) => {
  console.log('tableChange', _pagination);
  pagination.current = _pagination.current as number
  await sensorQuery()
}

const alertMsg = computed(() => `传感器数量：${pagination.total}`)

const sensorFormRef = ref<FormInstance>();
const sensorInitData = {
  SensorCode: '',
  SensorName: '',
  greenHouseCode: 0, // 大棚id
  SensorType: '', // 1 光照度传感器；2 二氧化碳传感器；3 空气温度传感器； 4 土壤温度传感器；5 空气湿度传感器；6 土壤湿度传感器
  Volume: 0, // 测量值
  FloorVolume: 0, // 上限值
  CeilingVolume: 0, // 下限值
  Note: '', // 备注
}
let sensorFormState = reactive<SensorFormState>(sensorInitData);
let isEditSensor = ref(false)
let editSensorId: number | undefined
const addSensor = () => {
  isEditSensor.value = true
  editSensorId = undefined
  sensorFormState = reactive<SensorFormState>(sensorInitData)
}
const cancelAddSensor = () => {
  isEditSensor.value = false
}
const loading = ref<boolean>(false);
const handleEditSensor = async () => {
  const form = sensorFormRef.value as FormInstance;
  form.validate().then(async () => {
    console.log('sensorFormState', sensorFormState)
    const res = editSensorId ? (await sensorUpdate()) : (await sensorAdd())
    sensorQuery()
    message.success('传感器更新成功！')
    isEditSensor.value = false
  }).catch(err => {
    console.log('error', err);
  });
}
const updateSensor = (item: SensorFormState) => {
  isEditSensor.value = true
  editSensorId = item.id
  Object.keys(sensorFormState).forEach(key => {
    console.log('key', key, item[key])
    sensorFormState[key] = key == 'greenHouseCode' ? Number(item[key]) : item[key]
  })
}

const greenHouseList = ref<{
  id: number;
  greenhouseName: string;
}[]>([])
const getGreenHouseList = async () => {
  const res = await axiosInstance({
    method: 'post',
    url: '/green-house/page',
    data: {
      pageNo: 1,
      pageSize: 100,
    }
  })
  console.log('getGreenHouseList', res.data)
  greenHouseList.value = res.data.data.list || []
  return res.data
}
getGreenHouseList()

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
            name="SensorCode"
            label="传感器编号"
          >
            <a-input v-model:value="formState.SensorCode" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item
            name="SensorName"
            label="传感器名称"
          >
            <a-input v-model:value="formState.SensorName" placeholder=""></a-input>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-button type="primary" html-type="submit">搜索</a-button>
          <a-button style="margin: 0 8px" @click="onReset">重置</a-button>
        </a-col>
      </a-row>
    </a-form>

    <div>
      <a-button type="primary" @click="addSensor">新增</a-button>
      <a-button @click="sensorMultiDelete">批量删除</a-button>
    </div>

    <a-alert :message="alertMsg" type="info" show-icon />

    <a-button @click="dataFill(3, 'sensor')">Add</a-button>

    <a-table 
      :row-selection="{ selectedRowKeys: tableState.selectedRowKeys, onChange: onSelectChange }"
      :dataSource="dataSource" 
      :columns="columns"
      :pagination="pagination" 
      @change="tableChange" 
    >
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'operation'">
          <a @click.prevent="updateSensor(record)">编辑</a>
          <a-divider type="vertical" />
          <a-popconfirm
            v-if="dataSource.length"
            title="Sure to delete?"
            @confirm="sensorDelete(record.id, index)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
    
   <a-modal v-model:visible="isEditSensor" title="新增传感器">
      <template #footer>
        <a-button key="back" @click="cancelAddSensor">取 消</a-button>
        <a-button key="submit" type="primary" :loading="loading" @click="handleEditSensor">提 交</a-button>
      </template>
      <a-form
        ref="sensorFormRef"
        name="sensor"
        :model="sensorFormState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item
          name="SensorCode"
          label="传感器编号"
          :rules="[{ required: !editSensorId, message: '请输入传感器编号!' }]"
        >
          <a-input v-model:value="sensorFormState.SensorCode" placeholder=""></a-input>
        </a-form-item>
        <a-form-item
          name="SensorName"
          label="传感器名称"
          :rules="[{ required: !editSensorId, message: '请输入传感器名称!' }]"
        >
          <a-input v-model:value="sensorFormState.SensorName" placeholder=""></a-input>
        </a-form-item>
        <a-form-item
          name="SensorType"
          label="传感器类型"
          :rules="[{ required: !editSensorId, message: '请选择传感器类型!' }]"
        >
          <a-select
            ref="select"
            v-model:value="sensorFormState.SensorType"
          >
            <a-select-option v-for="item in SensorTypeList" :key="item.value" :value="item.value">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          name="greenHouseCode"
          label="所属大棚"
          :rules="[{ required: !editSensorId, message: '请选择大棚!' }]"
        >
          <a-select
            ref="select"
            v-model:value="sensorFormState.greenHouseCode"
          >
            <a-select-option v-for="item in greenHouseList" :key="item.id" :value="item.id">{{ item.greenhouseName }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-row>
          <a-col :span="6" class="volume-label">
            传感器阈值：
          </a-col>
          <a-col :span="18" class="volume-input">
            <a-form-item
              name="FloorVolume"
              label=""
            >
              <a-input-number v-model:value="sensorFormState.FloorVolume" placeholder=""></a-input-number>
            </a-form-item>
            <span>&nbsp;-&nbsp;</span>
            <a-form-item
              name="CeilingVolume"
              label=""
            >
              <a-input-number v-model:value="sensorFormState.CeilingVolume" placeholder=""></a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item
          name="Note"
          label="备注"
        >
          <a-textarea v-model:value="sensorFormState.Note" placeholder=""></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style scoped>
.volume-label {
  line-height: 32px;
  text-align: right;

}
.volume-input {
  display: flex;
  align-items: baseline;
}
</style>

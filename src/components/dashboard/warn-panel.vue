<template>
  <div class="wran-panel">
    <div class="sensor">
      <a-row :gutter="24">
        <a-col :span="12" v-for="item in sensorList" :key="item.id">
          <div :class="['card', {'is-warn': item.isWarn}]">
            <div class="card-title">
              <span>设备 {{ item.SensorCode }}</span><br>
              <span>({{ item.SensorTypeName }})</span>
            </div>
            <div class="card-value">
              <span>{{item.Volume}}{{ item.unit }}</span>
            </div>
            <!-- <div class="card-footer">
              <span>大棚：xxxxx</span>
            </div> -->
          </div>
        </a-col>
      </a-row>
    </div>
    <a-pagination 
      v-model:current="pagination.current" 
      :total="pagination.total" 
      show-less-items 
      @change="onChangePage"
    />
  </div>
</template>
<script lang="ts">
import {
  UserOutlined,
} from '@ant-design/icons-vue';
import { defineComponent, ref, onMounted, watch, provide, reactive } from 'vue';
import { useRouter, useRoute, RouterLink } from 'vue-router'
import axiosInstance from '@/utils/axios-instance'

export default defineComponent({
  components: {
  },
  setup() {
    const router = useRouter()
    const route = useRoute()

    const SensorTypeList = [
      {
        label: '光照度传感器',
        value: '1',
        unit: 'lux'
      },
      {
        label: '二氧化碳传感器',
        value: '2',
        unit: 'ppm'
      },
      {
        label: '空气温度传感器',
        value: '3',
        unit: '℃'
      },
      {
        label: '土壤温度传感器',
        value: '4',
        unit: '℃'
      },
      {
        label: '空气湿度传感器',
        value: '5',
        unit: '%'
      },
      {
        label: '土壤湿度传感器',
        value: '6',
        unit: '%'
      }
    ]

    const sensorQuery = async () => {
      const res = await axiosInstance({
        method: 'post',
        url: '/sensor/page',
        data: {
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sample: true
        }
      })
      console.log('sensorQuery', res.data)
      pagination.total = res.data.data.total
      sensorList.value = res.data.data.list.map(item => {
        const type = SensorTypeList.find(type => type.value === item.SensorType) || {}
        item.SensorTypeName = type.label as string
        item.unit = type.unit as string
        item.isWarn = item.Volume < item.FloorVolume || item.Volume > item.CeilingVolume
  
        return item
      })
      return res.data
    }

    const pagination: {
      current: number;
      pageSize: number;
      total: number;
      showSizeChanger?: boolean;
      showQuickJumper?: boolean;
      showTotal?: (total: number) => string;
    } = reactive({
      current: 1,
      pageSize: 8,
      total: 0,
      // showSizeChanger: true,
      showQuickJumper: false,
      // showTotal: (total: number) => `共 ${total} 条`,
    })
    const sensorList = ref([])
    sensorQuery()

    const onChangePage = (page: number) => {
      // pagination.current = page
      sensorQuery()
    }

    onMounted(() => {
    })

    return {
      sensorList,
      pagination,
      onChangePage
    };
  },
});

</script>

<style scoped>
.wran-panel {
  
}
.wran-panel .sensor {
  height: 632px;
}
.card {
  background-color: rgb(153, 153, 153, 0.7);
  border-radius: 5px;
  color: #fff;
  margin-bottom: 24px;
}
.card.is-warn {
  background-color: rgb(245, 34, 45, 0.7);
}
.card-title {
  padding: 3px 8px;
  border-bottom: 1px solid #e8e8e8;
  text-align: center;
}
.card-value {
  padding: 16px 8px;
  text-align: center;
  font-size: 32px;
  border-bottom: 1px solid #e8e8e8;
}
.card-footer {
  padding: 8px;
  /* text-align: center; */
}
</style>


